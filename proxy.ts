import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';
import { docsContentRoute, docsRoute } from '@/lib/shared';

// `rewriteDocs` / `rewriteSuffix` handle "give me the raw markdown for this
// doc" content negotiation. An LLM bot can `curl -H "Accept: text/markdown"
// /docs/install` (or `/docs/install.md`) and we rewrite to the
// `/llms.mdx/docs/install/content.md` route handler.
//
// path-to-regexp (used by fumadocs-core/negotiation) doesn't accept the
// `{/:lang(en|zh-CN)}?` optional-regex syntax at runtime, so we register one
// pair of patterns per "lang prefix variant" (un-prefixed, `/en`, `/zh-CN`)
// and try each in order. The patterns themselves use only path-to-regexp v6+
// safe syntax (named params + `*path` wildcard).
const localePrefixes = ['', '/en', '/zh-CN'] as const;
const rewriteDocsByPrefix = localePrefixes.map((prefix) => {
  const docs = rewritePath(
    `${prefix}${docsRoute}{/*path}`,
    `${docsContentRoute}{/*path}/content.md`,
  );
  const suffix = rewritePath(
    `${prefix}${docsRoute}{/*path}.md`,
    `${docsContentRoute}{/*path}/content.md`,
  );
  return { docs: docs.rewrite, suffix: suffix.rewrite };
});

const i18nMiddleware = createI18nMiddleware(i18n);

function firstMatch(
  pathname: string,
  pick: (entry: (typeof rewriteDocsByPrefix)[number]) => (p: string) => string | false,
): string | false {
  for (const entry of rewriteDocsByPrefix) {
    const result = pick(entry)(pathname);
    if (result) return result;
  }
  return false;
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // 1. Explicit `.md` suffix wins regardless of Accept header.
  const suffixResult = firstMatch(pathname, (e) => e.suffix);
  if (suffixResult) {
    return NextResponse.rewrite(new URL(suffixResult, request.nextUrl));
  }

  // 2. Otherwise, if the client prefers markdown, serve the .md feed.
  if (isMarkdownPreferred(request)) {
    const result = firstMatch(pathname, (e) => e.docs);
    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  // 3. Fall through to the i18n middleware so un-prefixed paths get
  //    redirected to the visitor's preferred locale (or the default `en`).
  return i18nMiddleware(request, event);
}

export const config = {
  // Skip the request-rewriting hook for routes that are intentionally NOT
  // localized — API handlers, OpenGraph image generation, the LLM feeds,
  // Next.js internals, and any static asset path containing a "." (favicon,
  // images served from /public, etc.).
  matcher: [
    '/((?!api|og|llms\\.mdx|llms\\.txt|llms-full\\.txt|_next/static|_next/image|.*\\.).*)',
  ],
};

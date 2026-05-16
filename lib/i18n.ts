import { defineI18n } from 'fumadocs-core/i18n';

/**
 * i18n config for the docs site.
 *
 * Languages:
 *   - `en`     — default. English content lives in `*.mdx` (no locale suffix).
 *   - `zh-CN`  — Chinese (Simplified). Translated content lives in `*.zh-CN.mdx`.
 *                BCP-47 string; the hyphen is fine in URLs (we render
 *                `/zh-CN/docs/...`) and in Fumadocs' locale key.
 *
 * When a `zh-CN` page has no translated file yet, Fumadocs falls back to the
 * default-language file silently — so this PR can ship before any translation
 * exists and `/zh-CN/...` will simply mirror the English content until the
 * translation PR lands.
 */
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'zh-CN'],
});

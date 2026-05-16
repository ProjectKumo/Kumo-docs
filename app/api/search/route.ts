import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// `createFromSource` automatically reads `i18n` from the source loader and
// splits the index per language. Until we ship a zh-CN tokenizer (Mandarin
// support lives in `@orama/tokenizers`), both locales fall back to the
// english tokenizer — fine while the zh-CN translation hasn't landed.
// See https://docs.orama.com/docs/orama-js/supported-languages
export const { GET } = createFromSource(source, {
  language: 'english',
});

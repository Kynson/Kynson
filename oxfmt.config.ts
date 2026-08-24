import { defineConfig } from 'oxfmt';

export default defineConfig({
  singleQuote: true,
  sortImports: {
    groups: [
      ['type-parent', 'type-sibling', 'type-index'],
      'type-internal',
      'type-import',
      'value-builtin',
      'value-external',
      ['value-parent', 'value-sibling', 'value-index'],
      'value-internal',
      'unknown'
    ]
  },
  trailingComma: 'none'
});

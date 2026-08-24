import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'error',
    pedantic: 'warn',
    perf: 'warn',
    restriction: 'error',
    style: 'error',
    suspicious: 'warn'
  },
  options: { typeAware: true, typeCheck: true },
  overrides: [
    {
      files: ['tests/**/*.test.ts'],
      rules: {
        'no-magic-numbers': 'off'
      }
    }
  ],
  rules: {
    // Use the typescript version instead
    'func-style': ['error', 'declaration'],
    'id-length': ['error', { exceptions: ['i', 'j', 'k'] }],
    'max-lines-per-function': ['error', { skipBlankLines: true, skipComments: true }],
    'max-statements': ['error', { max: 30 }],
    'no-continue': 'off',
    'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
    'no-magic-numbers': [
      'error',
      {
        // Common for bit flip, array indexing, default values, and time conversions
        ignore: [-1, 0, 1, 60, 1000],
        ignoreEnums: true,
        ignoreReadonlyClassProperties: true,
        ignoreTypeIndexes: true
      }
    ],
    'no-null': 'off',
    'no-plusplus': 'off',
    'no-ternary': 'off',
    'node/no-top-level-await': 'off',
    'one-var': 'off',
    // This conflicts with the `no-null` rule as it will prevent both `null` and `undefined` from being used.
    'oxc/no-async-await': 'off',
    'oxc/no-optional-chaining': 'off',
    'require-await': 'off',
    // Declaration sort is handled by oxfmt
    'sort-imports': ['error', { allowSeparatedGroups: true, ignoreDeclarationSort: true }],
    'typescript/consistent-return': 'off',
    'typescript/prefer-readonly-parameter-types': ['warn', { ignoreInferredTypes: true }],
    'typescript/strict-boolean-expressions': [
      'error',
      {
        allowNullableBoolean: true,
        allowNullableNumber: true,
        allowNullableString: true
      }
    ]
  }
});

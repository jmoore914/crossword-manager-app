module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 202
    },
    rules: {
        '@typescript-eslint/indent': ['error', 'tab'],
        '@typescript-eslint/quotes': ['error', 'single', {avoidEscape: true}],
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/prefer-for-of': 2,
        '@typescript-eslint/member-delimiter-style': ['error'],
        '@typescript-eslint/explicit-function-return-type': 2,

        'vue/html-indent': ['error', 'tab'],
        'vue/mult-word-component-names': 0,

        'array-callback-return': 2,
        'eqeqeq': 2,
        'comma-style': ['error', 'last'],
        'comma-spacing': 2,
        'function-paren-newline': ['error', 'never'],
        'one-var': [2, 'never'],
        'quotes': [2, 'single'],
        'semi-style': [2, 'last'],
        'no-const-assign': 2,
        'array-bracket-spacing': [2, 'never'],
        'object-curly-spacing': [2, 'never'],
        'object-curly-newline': [2, {ImportDeclaration: 'never'}],
        'no-cond-assign': 2,
        'no-duplicate-imports': 2,
        'no-dupe-else-if': 2,
        'curly': 2,
        'dot-location': [2, 'property'],
        'dot-notation': 2,
        'no-param-reassign': 2,
        'no-self-compare': 2,
        'no-unmodified-loop-condition': 2,
        'no-unused-expressions': [2, {'allowTernary': true}]
    }
}
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
		ecmaVersion: 2020
	},
	rules: {
		'@typescript-eslint/indent': [2, 'tab'],
		'@typescript-eslint/quotes': [2, 'single', {avoidEscape: true}],
		'@typescript-eslint/semi': [2, 'always'],
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/no-var-requires': 0,
		'@typescript-eslint/prefer-for-of': 2,
		'@typescript-eslint/member-delimiter-style': 2,
		'@typescript-eslint/explicit-function-return-type': 2,

		'vue/html-indent': [2, 'tab'],
		'vue/multi-word-component-names': 0,
		'vue/custom-event-name-casing': 2,
		'vue/define-emits-declaration': 2,
		'vue/define-props-declaration': 2,
		'vue/next-tick-style': 2,
		'vue/no-required-prop-with-default':2,

		'array-callback-return': 2,
		'eqeqeq': 2,
		'comma-style': [2, 'last'],
		'comma-spacing': 2,
		'function-paren-newline': [2, 'never'],
		'one-var': [2, 'never'],
		'quotes': [2, 'single'],
		'semi-style': [2, 'last'],
		'array-bracket-spacing': [2, 'never'],
		'object-curly-spacing': [2, 'never'],
		'object-curly-newline': [2, {ImportDeclaration: 'never'}],
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
};
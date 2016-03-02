module.exports = {
	"parser": "babel-eslint",
	"rules": {
		// Javascript part
		"strict": 0,
		"indent": [
			2,
			"tab",
			{"SwitchCase": 1}
		],
		"quotes": [
			2,
			"double"
		],
		"jsx-quotes": [2, "prefer-double"],
		"linebreak-style": [
			2,
			"unix"
		],
		"semi": [
			2,
			"always"
		],
		"no-console":0,
		
		// React part
		"react/jsx-boolean-value": [1, "always"],
		"react/jsx-closing-bracket-location": 1,
		"react/jsx-curly-spacing": 1,
		"react/jsx-handler-names": 1,
		"react/jsx-indent-props": [2, "tab"],
		"react/jsx-indent": [2, "tab"],
		"react/jsx-key": 1,
		"react/jsx-max-props-per-line": 1,
		"react/jsx-no-bind": 1,
		"react/jsx-no-duplicate-props": 1,
		"react/jsx-no-literals": 1,
		"react/jsx-no-undef": 1,
		"react/jsx-pascal-case": 1,
		"react/jsx-sort-prop-types": 1,
		"react/jsx-uses-react": 1,
		"react/jsx-uses-vars": 1,
		"react/no-danger": 1,
		"react/no-deprecated": 1,
		"react/no-did-mount-set-state": 1,
		"react/no-did-update-set-state": 1,
		"react/no-direct-mutation-state": 1,
		"react/no-is-mounted": 1,
		"react/no-multi-comp": 1,
		"react/no-set-state": 1,
		"react/no-string-refs": 1,
		"react/no-unknown-property": 1,
		"react/prefer-es6-class": 1,
		"react/prop-types": 1,
		"react/react-in-jsx-scope": 1,
		"react/require-extension": 1,
		"react/self-closing-comp": 1,
		"react/sort-comp": 1,
		"react/wrap-multilines": 1,

		// Mocha part
		"mocha/no-exclusive-tests": 2
	},
	"env": {
		"es6": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"ecmaFeatures": {
		"jsx": true,
		"experimentalObjectRestSpread": true,
		"modules": true
	},
	"plugins": [
		"react",
		"mocha"
	],
	"settings": {
		"react": {
			"pragma": "React"
		}
	}
};
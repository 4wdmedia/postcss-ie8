# postcss-ie8

[postcss](https://github.com/postcss/postcss) plugin for transforming a stylesheet to an IE8-compatible stylesheet.

## Installation

```js
npm install postcss-ie8
```

## Options

### `selectors`

Type: `Array`

Array with regular expressions of selectors which should be removed.

**Example**
```js
{
	selectors: [
		/:last-child/,
		/:nth-child/,
		/:nth-last-child/,
	]
}
```

### `atRules`

Type: `Array`

Array of atRules to remove.

**Default**
```js
{
	atRules: [
		'keyframes',
		'supports',
		'document',
	]
}
```

### `removePrefixes`

Type: `Boolean`
Default: `false`

Remove all prefixes in declarations.

### `properties`

Type: `Array`

Array with regular expressions of properties which should be removed.

### `values`

Type: `Array`

Array with regular expressions of values which should be removed.

### `mqOptions`

Type: `Object`

Options for css-mediaquery.

**Default**
```js
{
	type: 'screen',
	width: '1024px'
}
```

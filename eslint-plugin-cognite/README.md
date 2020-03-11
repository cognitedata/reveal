# @cognite/eslint-plugin

Custom eslint rules for Cognite's front-end applications.

## Installation

You will need to install [ESLint](https://eslint.org):

```
$ yarn add --dev eslint
```

And install [eslint-config-cognite](https://github.com/cognitedata/eslint-config-cognite):

```
$ yarn add --dev @cognite/eslint-config
```

Next, install `@cognite/eslint-plugin`:

```
$ yarn add --dev @cognite/eslint-plugin
```

## Usage

Add `cognite` to the plugins section of your `.eslintrc` configuration file. You can omit the `/eslint-plugin` suffix:

```json
{
  "plugins": ["@cognite"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "@cognite/no-number-z-index-styled-components": "error"
  }
}
```

## Supported Presets

Presets are enabled by adding a line to the `extends` list in your config file. For example, to enable the `all` preset, use:

```json
{
  "extends": ["plugin:@cognite/all"]
}
```

- `all` enables all rules from this plugin.
- `noNumZIndex` enables all the rules that prevent numbers with z-indexes.
- `insight` enables all rules native to insight.
- `opsup` enables all rules native to operations support.

## Supported Rules

Here are all the individual rules you can use:

### [@cognite/no-number-z-index-inline-styling](https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/no-number-z-index-inline-styling.md) - z-index util should be used inline

### [@cognite/no-number-z-index-property](https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/no-number-z-index-property.md) - z-index util should be used as a prop

### [@cognite/no-number-z-index-styled-components](https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/no-number-z-index-styled-components.md) - z-index util should be used in styled components

### [@cognite/require-styled-macro](https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/require-styled-macro.md) - Make sure styled-components/macro is used

### [@cognite/require-t-function](https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/require-t-function.md) - Trans should be passed as a prop

### [@cognite/no-unissued-todos](https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/no-unissued-todos.md) - TODO's in code require a JIRA ticket

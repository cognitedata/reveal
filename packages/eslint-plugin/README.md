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
    "@cognite/no-number-z-index": "error"
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

### [@cognite/no-number-z-index]

z-index util should be used.

### [@cognite/no-sdk-submodule-imports]

Importing from `@cognite/sdk` should only happen from the top-level.

### [@cognite/no-unissued-todos]

TODO's in code require a JIRA ticket.

### [@cognite/hellip]

Ensures that ... is rendered as a horizontal ellipsis.

### [@cognite/require-t-function]

`<Trans />` should be passed `t` as a prop.

### [@cognite/styled-macro]

Make sure that `styled-components/macro` is correctly used.

[@cognite/no-number-z-index]: https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/no-number-z-index.md
[@cognite/no-sdk-submodule-imports]: https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/no-sdk-submodule-imports.md
[@cognite/no-unissued-todos]: https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/no-unissued-todos.md
[@cognite/require-hellip]: https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/require-hellip.md
[@cognite/require-t-function]: https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/require-t-function.md
[@cognite/styled-macro]: https://github.com/cognitedata/eslint-plugin-cognite/blob/master/docs/rules/styled-macro.md

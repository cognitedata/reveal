# eslint-plugin-cognite

Custom eslint rules for Cognite's front-end applications. 

## Installation

Install `eslint-plugin-cognite`:

```
$ yarn add --dev eslint-plugin-cognite
```
## Usage

Add `cognite` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "cognite"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "cognite/no-number-z-index-styled-components": "error"
    }
}
```

## Supported Presets

Presets are enabled by adding a line to the `extends` list in your config file. For example, to enable the `all` preset, use:

```json
{
    "extends": [
        "plugin:cognite/all"
    ]
}
```

* `all` enables all rules from this plugin.
* `noNumZIndex` enables all the rules that prevent numbers with z-indexes.


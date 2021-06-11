## `styled-macro`

Enforce the correct `styled-components/macro` usage.

There is one option supported by this rule:

```js
  '@cognite/styled-macro': ['error', 'forbid'], // or 'require' (default)
```

### `require`

In order to simplify navigation between DOM nodes and actual `styled-components` for development environment we want to have `<component names>-<styled-component name>` classnames inside the DOM.
In order to enable that we need to ensure `styled` was imported from `styled-components/macro` instead of `styled-components`.

### `forbid`

`styled-components/macro` is not always desireable.
In fact, there are some cases where it should be forbidden (libraries, for example).

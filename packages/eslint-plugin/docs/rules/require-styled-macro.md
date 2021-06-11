## `require-styled-macro`

In order to simplify navigation between DOM nodes and actual `styled-components` for development environment we want to have `<component names>-<styled-component name>` classnames inside the DOM. In order to enable that we need to ensure `styled` was imported from `styled-components/macro` instead of `styled-components`.

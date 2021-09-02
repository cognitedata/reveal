# @cognite/react-comments

Comment components using the Commenting Service

## Installation

```sh
yarn add @cognite/react-comments
```

Happy hacking!

## Troubleshooting

If you use this outside of the mono repo, you need to make sure you have the exact same versions of things like `@cognite/react-container` installed in your calling app.

This is because it uses context from react-container etc. So if this package installs another local version, you will have different context, and things like your `authState` will not be found.

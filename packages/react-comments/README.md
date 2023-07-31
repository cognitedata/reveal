# @cognite/react-comments

Comment components using the Commenting Service

## Installation

```sh
yarn add @cognite/react-comments
```

Happy hacking!

## Usage

For usage examples, please see the demo app.

Note: user detection is opt-in, so you need to add `enableUserManagement` to your sidecar config.

## Troubleshooting

If you use this outside of the monorepo, you need to make sure you have the exact same versions of things like `@cognite/react-container` installed in your calling app.

This is because it uses context from react-container etc. So if this package installs another local version, you will have different context, and things like your `authState` will not be found.

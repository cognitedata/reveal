# cdf-sdk-singleton

Library used in `/cdf/` (`fusion`) sub-apps that handles Cognite SDK Client instance and authentication.
The code is used as SystemJS library for SingleSPA sub-apps and as ESM module for module federation.

# Building the library

When the library is used as ESM, everything is handled by NX and the code is used as internal library (bundled).
For this, just run `nx run cdf-sdk-singleton:build` to build.

To build the library as a package for SingleSPA (SystemJS), run the following command: `nx run cdf-sdk-singleton:build-single-spa`.
When you build with `build-single-spa` as a target, the `webpack-config.js` file is used.

# How do I use the cognite SDK?

The `@cognite/cdf-sdk-singleton` package is made available at runtime for your sub app. To use it, you need to do 2 things.

`yarn add @cognite/cdf-sdk-singleton`

Define @cognite/cdf-sdk-singleton as a webpack external library

```
webpack.config.externals = {
...
'@cognite/cdf-sdk-singleton': '@cognite/cdf-sdk-singleton',
}
```

2. In your app where you use the sdk, simply import it like this.

```
import sdk from '@cognite/cdf-sdk-singleton'

await sdk.assets.list()
```

# Testing the build

If you want to test the `cdf-sdk-singleton` build, you can:

1. Run `nx run cdf-sdk-singleton:serve-static` - this will compile the library and run the static files
2. Use import-map-overrides in Fusion/CDF to override the instance. Override `@cognite/cdf-sdk-singleton` with `http://localhost:3005/index.js`

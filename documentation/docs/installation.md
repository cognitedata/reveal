---
id: installation
title: Installation
---

```bash npm2yarn
npm install @cognite/reveal
```

:::tip important
Expose all `*.worker.js` and `*.wasm` files from `@cognite/reveal`
:::

This library uses web-workers and web-assembly, but it's tricky to bundle them into npm-package. 

That's why you will have to make sure that all `*.worker.js` and `*.wasm` files from `@cognite/reveal` are copied
to your project's output folder. 

Also, it's required to have a base tag pointing at your app base url. Add base location for relative URLs:

```html title="/index.html"
<head>
   <base href="/" /> 
``` 

### Create react app

1. Install [react-app-rewired](https://github.com/timarney/react-app-rewired). It's required to slightly modify react-scripts from create-react-app without running `eject`

    ```bash npm2yarn
    npm install react-app-rewired --save-dev
    ```
   
1. 'Flip' the existing calls to `react-scripts` in `npm` scripts for start, build and test
 
   ```diff title="/package.json"
     "scripts": {
   -   "start": "react-scripts start",
   +   "start": "react-app-rewired start",
   -   "build": "react-scripts build",
   +   "build": "react-app-rewired build",
   -   "test": "react-scripts test",
   +   "test": "react-app-rewired test",
       "eject": "react-scripts eject"
   }
   ```

1. Install [copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/)
    
   ```bash npm2yarn
    npm install copy-webpack-plugin --save-dev
    ```

1. Create a `config-overrides.js` file in the root directory with the following content

    ```javascript title="./config-overrides.js"
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    
    const revealSource = 'node_modules/@cognite/reveal';
    
    module.exports = function override(config) {
      if (!config.plugins) {
        // eslint-disable-next-line no-param-reassign
        config.plugins = [];
      }
    
      // that's for 6.x version of webpack-copy-plugin
      // if you use 5.x just put content of patterns into constructor
      // new CopyWebpackPlugin([ /* { from, to } */ ])
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: `${revealSource}/**/*.worker.js`,
              to: '.',
              flatten: true,
            },
            {
              from: `${revealSource}/**/*.wasm`,
              to: '.',
              flatten: true,
            },
          ],
        })
      );
    
      return config;
    };
    ```
   
Now all `*.worker.js` and `*.wasm` files from `@cognite/reveal` should be copied into your output folder when you run build.

### Non create-react-app based projects

Just make sure that you have `*.worker.js` and `*.wasm` files from `@cognite/reveal` in your output folder.
If you use webpack, you might want to add [copy-webpack-plugin@^5.1.1](https://webpack.js.org/plugins/copy-webpack-plugin/)
in your `webpack.config.js`

```javascript
// webpack.config.js
const revealSource = 'node_modules/@cognite/reveal';

{
  /* ... */
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${revealSource}/**/*.worker.js`,
          to: '.',
          flatten: true,
        },
        {
          from: `${revealSource}/**/*.wasm`,
          to: '.',
          flatten: true,
        },
      ],
    })
  ]
}
```

### Content-type

:::tip important
Make sure your server sends `*.wasm` files with `Content-type: application/wasm` header.
:::

Sometimes servers don't have correct MIME type set for wasm files. 
In that case you might notice this message in a browser console when it fetches a `.wasm` file:

> Uncaught (in promise) TypeError: Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.

In that case you need to configure your server to set the `Content-type: application/wasm` header for `*.wasm` files. 
If you use the nginx add [types](https://nginx.org/en/docs/http/ngx_http_core_module.html#types) in the config 
or edit the [mime.types file](https://www.nginx.com/resources/wiki/start/topics/examples/full/#mime-types). 

```types title="/mime.types"
types {
    application/wasm wasm;
}
```

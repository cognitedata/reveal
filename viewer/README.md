# Reveal viewer

## Install

...

### Expose all `*.worker.js` and `*.wasm` files from `@cognite/reveal` 

This library uses web-workers and web-assembly, but it's tricky to bundle them into npm-package. 

That's why you will have to make sure that all `*.worker.js` and `*.wasm` files from `@cognite/reveal` are copied
to your project's output folder. 

#### Create react app

1. Install [react-app-rewired](https://github.com/timarney/react-app-rewired). 
It's required to slightly modify react-scripts from create-react-app without running `eject`

    ```bash
    npm install react-app-rewired --save-dev
    ```
   
1. 'Flip' the existing calls to `react-scripts` in `npm` scripts for start, build and test
 
   ```diff
     /* package.json */
   
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
    
   ```bash
    npm install copy-webpack-plugin --save-dev
    ```

1. Create a `config-overrides.js` file in the root directory with the following content

    ```javascript
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

1. In your `index.html` file add base location for relative URLs:

    ```html
    <head>
       <base href="/" /> 
    ``` 
   
Now all `*.worker.js` and `*.wasm` files from `@cognite/reveal` should be copied into your output folder when you run build.

#### Non create-react-app based projects

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

## Local development

To run the test project on a local server:

```bash
npm run serve
```

Important: Node version 10 is necessary for wasm-pack to work.

## Coordinate systems

The data served from Cognite Data Fusion is in a right-handed coordinate system with Z up,
X to the right and Y pointing into the screen.

In Three.js, which is supported by the Reveal viewer, the coordinate system is right-handed with
Y up, X to the right and Z pointing out of the screen.

### Conversion between the different coordinate systems

The policy in this repository is to stick with the CDF coordinate system in any code that is not
viewer-specific.
For viewer-specific code, the conversion should happen as early as possible.

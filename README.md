# Developing on Visual Studio Code

Recommended extensions:
- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) - for continously running unit tests and showing results inline in the editor.
- [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin) - for formatting source code

# Starting development web server

## 3D view only
- Start the web server: `npm install && npm run serve`
- Open a browser to [localhost:8080](http://localhost:8080).

## Application with React User interface
- start react app: `npm install && npm run start-dev`

## Standalone React application that uses library outpu of this project
- Navigate to *standalone* directory: `cd standalone`
- Start react app with web server: `npm run start`

Web server will restart and browser will automatically update whenever a file changes.

# Output Production Bundles

This project exposes the application as a react component library and as well as a standalone react application.

## Standalone application
- Navigate to *standalone* directory: `cd standalone`
- Produce standalone application build: `npm run build`

Optimized standalone application build will be created in **standalone/build** directory.

## React component library
- Run build command in project base directory: `npm run build`

Project build as a library will be created in **dist** folder.


# Library output usage

If you are planning to use this project library output in another project follow these steps

- Build the library output: `npm install && npm run build`
- Navigate to build output and link: `cd dist && npm link`
- Go to the project that you intend to use the library and link:`<navigate to project> && npm link @cognitedata/subsurface-visualizer`
- Import React component and reducer function:

```javascript

import {
  SubsurfaceVisualizer,
  SubsurfaceReducer
} from "@cognitedata/subsurface-visualizer";

```
- Add the component and provide a store

```javascript
import { createStore } from "redux";

function App() {
  const store = createStore(SubsurfaceReducer, {});
  return (
    <div className="App">
      <SubsurfaceVisualizer store={store} />
    </div>
  );
}

export default App;

```
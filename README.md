# Cognite Subsurface Visualizer

This is a monorepo for all subsurface visualization features in cognite. Please find the links below to eachof the packages available in this repo.

| Project               |              Package               |                                                                                              Readme |
| --------------------- | :--------------------------------: | --------------------------------------------------------------------------------------------------: |
| Subsurface Visualizer | @cognitedata/subsurface-visualizer |                                                                                         This Readme |
| Subsurface Components |   @cognite/subsurface-interfaces   |  [Readme]{https://github.com/cognitedata/subsurface-visualization/blob/master/src/Interface#readme} |
| Subsurface Interfaces | @cognitedata/subsurface-components | [Readme]{https://github.com/cognitedata/subsurface-visualization/blob/master/src/Components#readme} |

## Developing on Visual Studio Code

Recommended extensions:

- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) - for continously running unit tests and showing results inline in the editor.
- [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin) - for formatting source code

## Starting development web server

### 3D view only

- Start the web server: `npm install && npm run serve`
- Open a browser to [localhost:8080](http://localhost:8080).

### Application with React User interface

- start react app: `npm install && npm run start-dev`

### Standalone React application that uses library output of this project

- Navigate to _standalone_ directory: `cd standalone`
- Start react app with web server: `npm run start`

Web server will restart and browser will automatically update whenever a file changes.

# Output Production Bundles - Subsurface Visualizer

This project exposes the application as a react component library and as well as a standalone react application.

## Standalone application

- Navigate to _standalone_ directory: `cd standalone`
- Produce standalone application build: `npm run build`

Optimized standalone application build will be created in **standalone/build** directory.

## React component

- Run build command in project base directory: `npm run build`

Project build as a library will be created in **dist/subsurface-visualizer** folder.

# Subsurface-visualizer library output usage

If you are planning to use this project library output in another project follow these steps.

First,

- install needed dependencies in you app (if not already installed) - `npm i --save react react-dom redux react-redux`
- navigate to this project folder and run - `npm install`
- Build the library output: `npm run build`
- Navigate to build output and link: `cd dist/subsurface-visualizer && npm link`
- Go to the project that you intend to use the library and link:`<navigate to project> && npm link @cognitedata/subsurface-visualizer`
- Import React component and reducer and store enhancers:

```javascript
import {
  SubsurfaceVisualizer,
  SubsurfaceReducer,
  SubsurfaceMiddleware
} from "@cognitedata/subsurface-visualizer";
```

- Add the component and provide a store

```javascript
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";

const store = createStore(
  combineReducers({ ...SubsurfaceReducer }),
  applyMiddleware(...SubsurfaceMiddleware)
);

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <SubsurfaceVisualizer store={store} />
      </Provider>
    </div>
  );
}
```

## fix invalid hooks call error

Due to nature of react if you are using npm link, this library and your app needs to use the same react instance.

To fix this issue navigate this project and run -`npm link <path-to-your-app>/node_modules/react` in this project.

- run build again : `npm run build`

Then, start your app, everything should work fine.

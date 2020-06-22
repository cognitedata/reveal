# Cognite Subsurface Visualizer

This is a monorepo for all subsurface visualization features in cognite. Please find the links below to eachof the packages available in this repo.

| Project               |            Package             |                                                                                              Readme |
| --------------------- | :----------------------------: | --------------------------------------------------------------------------------------------------: |
| Subsurface Visualizer | @cognite/subsurface-visualizer |                                                                                         This Readme |
| Subsurface Interfaces | @cognite/subsurface-interfaces |  [Readme](https://github.com/cognitedata/subsurface-visualization/blob/master/src/Interface#readme) |
| Subsurface Components | @cognite/subsurface-components | [Readme](https://github.com/cognitedata/subsurface-visualization/blob/master/src/Components#readme) |

## Subsurface Visualizer library usage

### for cognite org users in npm

This package is available as a private package in [npm](https://www.npmjs.com/package/@cognite/subsurface-visualizer).
To use this library user must be a member of cognite organization in npm.

- login to npm and follow steps : `npm login`
- install library : `npm i @cognite/subsurface-visualizer`
- Import React component and reducer and store enhancers:

```javascript
import {
  SubsurfaceVisualizer,
  SubsurfaceReducer,
  SubsurfaceMiddleware
} from "@cognite/subsurface-visualizer";
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
      <Provider>
        <SubsurfaceVisualizer />
      </Provider>
    </div>
  );
}
```

## Customizing Subsurface Visualizer

Limited number of CSS Custom Properties are available to customize the appearance of subsurface visualizer.
If the css properties are not set default values will be used.

| Css Custom Property Name                          |
| ------------------------------------------------- |
| --subsurface-viz-background                       |
| --subsurface-viz-tree-background                  |
| --subsurface-viz-tree-color                       |
| --subsurface-viz-tab-background                   |
| --subsurface-viz-tab-select-background            |
| --subsurface-viz-tab-select-color                 |
| --subsurface-viz-title-bar-background             |
| --subsurface-viz-title-bar-color                  |
| --subsurface-viz-expansion-header-background      |
| --subsurface-viz-expansion-header-color           |
| --subsurface-viz-expansion-detail-background      |
| --subsurface-viz-expansion-detail-color           |
| --subsurface-viz-toolbar-icon-selected-background |
| --subsurface-viz-toolbar-icon-hover-background    |
| --subsurface-viz-select-input-background          |
| --subsurface-viz-select-input-option-color        |
| --subsurface-viz-slider-input-background          |

refer [default theme section](https://github.com/cognitedata/subsurface-visualization/blob/master/src/UserInterface/styles/scss/index.scss) for fallback values.

### Customizing Tree Control

refer [Tree Control Readme](https://github.com/cognitedata/subsurface-visualization/blob/master/src/Components#readme)

### Examples

refer [theme for standalone Application](https://github.com/cognitedata/subsurface-visualization/blob/master/src/UserInterface/styles/scss/theme.scss)

## For Contributors

### Developing on Visual Studio Code

Recommended extensions:

- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) - for continously running unit tests and showing results inline in the editor.
- [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin) - for formatting source code

### Starting development web server

#### 3D view only

- Start the web server: `npm install && npm run serve`
- Open a browser to [localhost:8080](http://localhost:8080).

#### Application with React User interface

- start react app: `npm install && npm run start-dev`

#### Standalone React application that uses library output of this project

- Navigate to _standalone_ directory: `cd standalone`
- Start react app with web server: `npm run start`

Web server will restart and browser will automatically update whenever a file changes.

### Output Production Bundles - Subsurface Visualizer

This project exposes the application as a react component library and as well as a standalone react application.

#### Standalone application

- Navigate to _standalone_ directory: `cd standalone`
- Produce standalone application build: `npm run build`

Optimized standalone application build will be created in **standalone/build** directory.

#### React component

- Run build command in project base directory: `npm run build`

Project build as a library will be created in **dist/subsurface-visualizer** folder.

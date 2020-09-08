# Cognite Node Visualizer

This is a monorepo for a generic visualization of a tree of data (called nodes). Please find the links below to each of the packages available in this repo.

| Project               |            Package             |                                                                                              Readme |
| --------------------- | :----------------------------: | --------------------------------------------------------------------------------------------------: |
| Node Visualizer | @cognite/node-visualizer |                                                                                         This Readme |
| Node Visualizer Subsurface Module | @cognite/node-visualizer-subsurface |  [Readme](https://github.com/cognitedata/node-visualizer/blob/master/src/Interface#readme) |
| Node Visualizer Components | @cognite/node-visualizer-components | [Readme](https://github.com/cognitedata/node-visualizer/blob/master/src/Components#readme) |

## Node Visualizer library usage

### for cognite org users in npm

This package is available as a private package in [npm](https://www.npmjs.com/package/@cognite/node-visualizer).
To use this library user must be a member of cognite NPM organization.

- login to npm and follow steps : `npm login`
- install library : `npm i @cognite/node-visualizer`
- Import React component and reducer and store enhancers:

```javascript
import {
  NodeVisualizer,
  NodeVisualizerReducer,
  NodeVisualizerMiddleware
} from "@cognite/node-visualizer";
```

- Add the component and provide a store

```typescript jsx
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";

const store = createStore(
  combineReducers({ ...NodeVisualizerReducer }),
  applyMiddleware(...NodeVisualizerMiddleware)
);

function App() {
  return (
    <div className="App">
      <Provider>
        <NodeVisualizer />
      </Provider>
    </div>
  );
}
```

## Customizing Appearance

Limited number of CSS Custom Properties are available to customize the appearance of Application.
If the css properties are not set, default values will be used.

| Css Custom Property Name                          |
| ------------------------------------------------- |
| --node-viz-background                       |
| --node-viz-tree-background                  |
| --node-viz-tree-color                       |
| --node-viz-tab-background                   |
| --node-viz-tab-select-background            |
| --node-viz-tab-select-color                 |
| --node-viz-title-bar-background             |
| --node-viz-title-bar-color                  |
| --node-viz-expansion-header-background      |
| --node-viz-expansion-header-color           |
| --node-viz-expansion-detail-background      |
| --node-viz-expansion-detail-color           |
| --node-viz-toolbar-icon-selected-background |
| --node-viz-toolbar-icon-hover-background    |
| --node-viz-select-input-background          |
| --node-viz-select-input-option-color        |
| --node-viz-slider-input-background          |
| --node-viz-default-font-size                |
| --node-viz-icon-size                        |
| --node-viz-readonly-input-color             |
| --node-viz-secondary-header-font-size       |

refer [default theme section](https://github.com/cognitedata/node-visualization/blob/master/src/UserInterface/styles/scss/index.scss) for fallback values.

Furthermore override Material Default Theme

example: 
```typescript jsx
const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[300],
    },
    secondary: {
      main: grey[50],
    },
  },
  typography: {
    fontSize: 16 * Appearance.ApplicationDefaultFontSize,
    body1: {
      fontSize: 16 * Appearance.ApplicationDefaultFontSize,
    },
  },
});

<ThemeProvider theme={theme}>
   <NodeVisualizer root={root} />
</ThemeProvider>
```
Further more custom appearance variables are available in [Appearance.ts](https://github.com/cognitedata/node-visualizer/blob/master/src/Core/States/Appearance.ts)

### Customizing Tree Control

refer [Tree Control Readme](https://github.com/cognitedata/node-visualization/blob/master/src/Components#readme)

### Examples

refer [theme for standalone Application](https://github.com/cognitedata/node-visualization/blob/master/src/UserInterface/styles/scss/theme.scss)

## For Contributors

### Developing on Visual Studio Code

Recommended extensions:

- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) - for continuously running unit tests and showing results inline in the editor.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - for linting source code

### Starting development web server

- Create a folder as /src/Solutions/BP/MockData/Sample and place the sample data files which can be downloaded from https://drive.google.com/drive/folders/1bCFeC9YcWdbDsx0vZ1Uf59PJoreLBGYj?usp=sharing

#### 3D view only

- Start the web server: `npm install && npm run serve`
- Open a browser to [localhost:8080](http://localhost:8080).

#### Application with React User interface

- start react app: `npm install && npm run start:dev`

#### Standalone React application that uses library output of this project

- Navigate to _standalone_ directory: `cd standalone`
- Start react app with web server: `npm run start`

Web server will restart and browser will automatically update whenever a file changes.

### Output Production Bundles - Node Visualizer

This project exposes the application as a react component library and as well as a standalone react application.

#### Standalone application

- Navigate to _standalone_ directory: `cd standalone`
- Produce standalone application build: `npm run build`

Optimized standalone application build will be created in **standalone/build** directory.

#### React component

- Run build command in project base directory: `npm run build`

Project build as a library will be created in **dist/node-visualizer** folder.

### Develop with Yarn Workspaces

- Clone bp-visualization and Node-visualizer projects into a root folder
- Create a `package.json` at root folder with the following content.
```
    {
        "private": true,
        "workspaces": [
            "bp-visualization",
            "node-visualizer"
        ]
    }
```

- Change "@cognite/node-visualizer" version in bp-visualization/package.json to match with node-visualizer version.
- Run `yarn` command at the root folder.
- Run `yarn build` command at the node-visualizer project. (You might have to run `build:types` also depending on the environment)
- Run `set https=true&&yarn start` at the bp-visualzation project.
- Make any change in the node-visualizer and run `yarn build` there. The bp-visualization will built automatically to reflect the changes.
- When subsurface standalone needs to be run, use start:root command which access the node modules from root folder.

#### Get dependencies for bp-visualization again from npm registry
- Change "@cognite/node-visualizer" version in bp-visualization/package.json to a valid version in npm registry. (It should not match with the locally built node-visualization version).
- If you face any conflicts/issues while getting dependencies back from npm registry, just remove or rename the root package.json and run `yarn` command from bp-visualization project


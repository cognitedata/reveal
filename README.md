# Cognite Node Visualizer

## Node Visualizer library usage

### for cognite org users in npm

This package is available as a private package in [npm](https://www.npmjs.com/package/@cognite/node-visualizer).
To use this library user must be a member of cognite NPM organization.

- login to npm and follow steps : `yarn login`
- install library : `yarn add @cognite/node-visualizer`
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
import { ThreeModule, SyntheticSubSurfaceModule } from '@cognite/node-visualizer';
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { Provider } from "react-redux";

// Create redux store
const store = createStore(
  combineReducers({ ...NodeVisualizerReducer }),
  applyMiddleware(...NodeVisualizerMiddleware)
);

// init three module
const modules = Modules.instance;

modules.clearModules();
modules.add(new ThreeModule());

// API_URL, API_KEY and FILE_ID come from env variables in this case
const syntheticModule = new SyntheticSubSurfaceModule();
syntheticModule.addSeismicCube(
  new CogniteSeismicClient({
    api_url: process.env.API_URL || 'https://api.cognitedata.com',
    api_key: process.env.API_KEY,
  }),
  process.env.FILE_ID
);
modules.add(syntheticModule);
modules.install();

const root = modules.createRoot();

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <NodeVisualizer root={root} />
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
      fontSize: 12,
      body1: {
        fontSize: 12,
      },
  },
});

<ThemeProvider theme={theme}>
   <NodeVisualizer root={root} />
</ThemeProvider>
```
Further more custom appearance variables are available in [Appearance.ts](https://github.com/cognitedata/node-visualizer/blob/master/src/Core/States/Appearance.ts)

## For Contributors

### Developing on Visual Studio Code

Recommended extensions:

- [Jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) - for continuously running unit tests and showing results inline in the editor.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - for linting source code

### Starting development web server

To start development you can run
```
yarn build:watch
yarn storybook
```
Then you can add some story to document functionality that you want add.

#### React component

- Run build command in project base directory: `npm run build`

Project build as a library will be created in **dist/node-visualizer** folder.


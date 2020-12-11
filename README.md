# Cognite Node Visualizer

## Node Visualizer library usage

### for cognite org users in npm

This package is available as a private package in [npm](https://www.npmjs.com/package/@cognite/node-visualizer).
To use this library user must be a member of cognite NPM organization.

- login to npm and follow steps : `yarn login`
- install library : `yarn add @cognite/node-visualizer`
- install peer-dependencies: `yarn add @cognite/cogs.js @reduxjs/toolkit react-redux redux styled-components`
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


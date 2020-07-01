This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)
and extended with [react-app-rewired](https://github.com/timarney/react-app-rewired) to copy reveal/viewer workers and wasm files to output folder.

## Getting started 

You need to build the viewer first and then the examples:

```bash
cd ./viewer
yarn install
yarn build

cd ../examples
yarn install
yarn start
```

Because we have local dependency on reveal like `"@cognite/reveal": "link:../viewer/dist"`, 
examples are not bound to specific viewer release from npm. They just use whatever you have in local viewer build.

## [Environment files](https://create-react-app.dev/docs/adding-custom-environment-variables/)

Create a copy of `.env.example` file and rename it to `.env`.
This file can be used to set environment variables which provides defaults for things like project name or model ids used in examples. 

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.<br />
This does not run the visual tests.

### `yarn ci:nossl`

Run the visual tests locally.

### `yarn snapshots:update`

Update failing visual test snapshots if deliberate changes are made.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# Data Exploration

## Running locally


### Prerequisites
Install [NX](https://www.npmjs.com/package/nx) globally: `npm install -g nx`

### Steps

1. Install package dependencies in the root of the monorepo:
   ```
   yarn
   ```
2. Navigate to the sub-app and start local development server
   ```
   cd apps/data-exploration
   yarn start
   ```
2. Navigate to [dev.fusion.cogniteapp.com](dev.fusion.cogniteapp.com)
3. Run `importMapOverrides.enableUI()` in the console
4. Click the <img width="32" valign="bottom" src="https://user-images.githubusercontent.com/6615090/165697621-dc80186c-2bdc-4f1c-90a1-d7ab4f985efc.png"> button that appears in the bottom right corner
5. Find `@cognite/cdf-data-exploration` module name and click on the row including it
6. Override using `https://localhost:3010/index.js` (port might differ depending on your local settings)
7. Click `Apply override` and refresh ✨

## Project structure

<img width="876" alt="image-20230215-133435" src="https://user-images.githubusercontent.com/70804363/226296463-ecd4c8e6-f7b8-4e4e-8939-6d42ac1e31cc.png">

For the libraries illustrated in the attachment, we can briefly explain the concern as follows:

* Core – general utilities, constants, functions, etc… that are used by the other libraries
* Domain layer – network/data layer, fetching and handing the internal and external state of data management
* Components – dumb components, base components that should not have any hooks/domain logic, just UI representation
* Containers – take components, domain layer, hooks, etc… and create “smart” components that are consumed by apps.

... and the application itself (data-explorer) is just concerned about managing the global state, the routing and general layout of the application. Most bulk of the logic lives in the libraries! 

> NOTE: We are currently undergoing a refactoring of moving logic and components from 'libs/data-exploration-components' into the respective sub-libraries inside of 'libs/data-exploration' -- please refrain from adding new login into the old folder.


## Troubleshooting

### I get "Refused to load the script `https://localhost:3010/index.js"` error when I apply a subapp override

1.  Open `https://localhost:3010/index.js` in a new tab.
2.  Ignore the security warning and click “Proceed to site”.
3.  Go back to dev.fusion.cogniteapp.com and refresh 🔄

To avoid doing this multiple times, enable this flag on Chrome:
[chrome://flags/#allow-insecure-localhost](chrome://flags/#allow-insecure-localhost)


### Still having issues?

Contact us on slack: [#tmp-explorers-squad](https://cognitedata.slack.com/archives/C041Y4SJXC6)

## Testing

```js
yarn test
```

For non-interactive single run:

```js
yarn test:once
```

## Releasing a new version to Fusion

The release process is documented on the [How to release](https://cognitedata.atlassian.net/wiki/spaces/DEGEXP/pages/3830743065/How+to+release) page

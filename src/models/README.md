# Models Folder

In this folder you will find all sources for the stateful logic of the applciation

The `models` folder is organized by source system and then by data model if needed

- `apps-api` - Functions related to the apps-api service apps-api.cognite.ai. These functions are used for getting the login tokens for using in firebase
- `calculation-backend` - Functions related to the calculation backend service
  - `configuration` - Configurations for the calculation backend calls
  - `operations` - Functions/Hooks for fetching the available operations
- `cdf` - Functions related to the CDF SDK and its calls
  - `assets`
  - `timeseries`
- `charts` - Models relative to the Frontend Application. The models here can derive from data models in other folders
  - `login` - Hooks and functions related to the login state and operations
  - `myCharts` - Hooks and functions related to the "My Charts" state in the main page
  - `publicCharts` - Hooks and functions related to the "Public Charts" state in the main page
- `firebase` - Hooks and functions related to firebase and not related to any other data models (login, initialization, etc)

## What is a guideline?

Important to say that guidelines were made to be followed in a best effort to keep the work standardized and understandable for others that are not familiar with the codebase.
But guidelines are not rigid and can be changed over time. Talk to the team to improve the guidelines if you find something that can be improved.

## Data Models Folder Organization Guidelines

Inside of the data model folders, is recommended to have some subfolders to organize the different types of functions.

- `hooks` - Hooks unrelated to React Query or Recoil
- `queries` - React Query hooks (`useQuery` or `useQueries`)
- `mutations` - React Query mutations (`useMutation`)
- `atom` - Recoil Atom hooks (`useRecoilState`)
- `atom-selectors` - Recoil Atom selector hooks (`useRecoilValue`)
- `selectors` - Pure selector functions. Pure selector functions are functions that calculate or transform state and don't depend on any hooks in order to run, just data from the models
- `services` - Functions that performs operations in the source systems. Calling firebase/calculation backend/etc through the SDK are examples
- `utils` - Utility functions using in the code. Small operations like doing a lookup search or indexing so you don't repeat yourself should be on this folder.
- `types` - Types commonly used in different files

## General Guidelines

- Think about the others when you code your data models. You won't be the the last one that will work with the codebase and new developers will be onboarded to it in the future. So thinking how others will read your code and understand it is crucial in order to deliver your work with the best possible quality.
- If you want to deviate from the guidelines, talk to the team and discuss the best way to improve the guidelines.
- Avoid exporting many functions in the same file. Separate multiple exported functions in different files so they can be detected as unused by [`ts-unused-exports`](https://www.npmjs.com/package/ts-unused-exports). Separating also makes finding/navigating them easier.
- When developing a data model, keep the data modeling clearly separated from the UI. Use the principles of [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) and [single responsibility](https://en.wikipedia.org/wiki/Single-responsibility_principle) as your best friends. Composability is important.
  - What does "keep the data modeling clearly separated from the UI" means? It means that the UI components should only display the data model contents and not implement any type of data transformation. If you want to apply a data transformation in a UI component, try to do this using a selector and pass as props to it. There are some examples on how this is done on many data models.
- Make tests. Untested data model functions are prone to bugs. Try your best to mock remote calls and test results of your hooks/selectors/mutations/utils/etc. This will ensure changes will not introduce regressions in the future. Use codecov as your best friend in reaching a good code coverage.

## File/Hook Naming Conventions

Some conventions and examples to make naming decisions easier. If you are unsure, talk to the team. What's important when naming is that others can understand the intentions behind it. Not only you.

- hooks
  - Start hook names with `use`. this will enable a series of validations using eslint.
- queries
  - `use{ModelName}` - Single record fetch by ID. Ex: `useAsset` (Fetch one `Asset` by `Asset['id']`)
  - `use{ModelNamePlural}` - Multiple records fetch by IDs. Ex: `useAssets` (Fetch multiple `Assets` by `Asset['id'][]`)
  - `use{ModelName}{DependentModelName}` - Single nested record fetch by data model. Ex: `useAssetDataset` (Fetch `Dataset` by `Asset`)
  - `use{ModelNamePlural}{DependentModelName}` - Nested records fetch by data model list. Ex: `useAssetsDataset` (Fetch `Dataset` by `Asset[]`)
  - `use{ModelNamePlural}{DependentModelNamePlural}` - Multiple nested records fetch by data model list. Ex: `useAssetsTimeseries` (Fetch `Timeseries[]` by `Asset[]`)
- mutations
  - `useCreate{ModelName}` - Single record create. Ex: `useCreateChart`
  - `useDelete{ModelName}` - Single record delete by ID. Ex: `useDeleteMyChart` (Delete one `MyChart` by `Chart['id']`)
  - `useDelete{ModelNamePlural}` - Multiple records delete by list of IDs. Ex: `useDeleteCalculations` (Delete many `Calculations` by `Calculation['id'][]`)
  - `useUpdate{ModelName}` - Single record update. Ex: `useUpdateChart`
  - `useUpdate{ModelNamePlural}` - Multiple records update at the same time. Ex: `useUpdatePermissions`

## React Query Key Conventions

Try to use an array describing the data model in the same hierarchy as the folder. This will make sure you will match it easily between devtools and the file structure. Don't be afraid of the array to become big.

Examples:
  - cdf
    - assets
      - `useAsset` - `['cdf', 'assets', assetId]`
      - `useAssets` - `['cdf', 'assets', ...assetIdList]`
      - `useAssetsTimeseries` - `['cdf', 'assets', assetId, 'timeseries']`
    - timeseries
      - `useTimeseriesAggregatedDatapoints` - `['cdf', 'timeseries', timseriesId, 'datapoints', startDate, endDate]`

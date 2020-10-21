# Node-Visualizer Standalone App

## Setup

1. Navigate to the (standalone) folder.
   1. `cd standalone`
2. create file .env.local with entry `REACT_APP_API_KEY=<your cognite api key>`
   1. `echo 'REACT_APP_API_KEY=<api key>' >> .env.local`
3. Install any other deps
   1. `yarn`

## Dev

1. Build the root node visualizer first (using dev build or prod build in root directory)
   1. `yarn build`
2. Navigate to the (standalone) folder.
   1. `cd standalone`
3. Start the app
   1. `yarn start`

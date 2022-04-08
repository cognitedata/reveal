# React Simconfig App

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## Setup for local development

- Follow the instructions provided in the [root repo](https://github.com/cognitedata/applications#setup-for-local-development)
- We also use [yalc](https://www.npmjs.com/package/yalc) . Install `npm i yalc -g` or `yarn global add yalc`

## How do I run my application locally?

1. Clone the repository
2. `cd apps/simconfig/`
3. Run `yarn start:bazel`, which will install all the required dependencies for the application and run the app at [https://localhost:3000/](https://localhost:3000/)
4. To run this app connected to local SimConfig services
   - First setup and run Sim Config services locally [how-do-i-run-my-service-locally](https://github.com/cognitedata/application-services/tree/master/services/simconfig-api#how-do-i-run-my-service-locally) in a separate terminal/IDE
   - Run `yalc add @cognite/simconfig-api-sdk` at the root repo and also at `cd app/simconfig/`
   - Run `yarn start:local:bazel` (at`app/simconfig/`)
   - To test and run local SimConfig services SDK changes on local UI, first follow the step 3 from [here](https://github.com/cognitedata/application-services/tree/master/services/simconfig-api#how-do-i-run-my-service-locally) and then remove `package.json` changes from main repo and simconfig app (`git checkout package.json` & `git checkout app/simconfig/package.json`) and run `yarn start:local:bazel`

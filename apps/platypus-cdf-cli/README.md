# platypus - A CLI for https://platypus.staging.cogniteapp.com/

## Commands

```bash
# Just empty command, but it should creates a new solution and dumps details in .platypusgrc
itg init
```

## Global variables

Set the COGNITE_CREDENTIALS variable with an api key for the respective cdf project to get access

## How to run

First build the library:
`nx build platypus-cli`

Then run the cli:
`node dist/libs/platypus-cli/src/index.js init <other-args>`

## Running unit tests

Run `nx test platypus-cli` to execute the unit tests via [Jest](https://jestjs.io).

# Cognite Scarlet

This app is served as an example [React]-based application served using frontend-app-server (FAS).

## Development

### Install dependencies

`> yarn`

### Start development server

`> yarn start`

See `package.json` for more scripts.

## Add facilities

In order to add a new facility to the application go to `src/config/facility` and add a new object - see current structure and extend. Each project should also have its own corresponding dataset ids, to add new set of dataset ids go to `src/config/dataset` - dataset ids are created in CDF and then utilized in this application.

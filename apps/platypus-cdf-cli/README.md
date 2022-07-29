# [CDF CLI](https://www.npmjs.com/package/@cognite/cdf-cli)

The CDF CLI's aim is to make it easier for developers to develop an app or solution on top of CDF. The CLI's current focus is on enabling key data modeling functionality, and we will expand towards other features in the future.

**NOTE: This package is still in early alpha and under active development. We will document and test actively, but please file bug report via the [Cognite Hub group](https://hub.cognite.com/groups/flexible-data-modeling-early-adopter-208)**

# Install (Globally)

```
yarn global add @cognite/cdf-cli
```

# Commands

We currently support these top level commands

| Top Level Command         | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| [`cdf signin`](#signin)   | Login with the CLI (alias: login)                          |
| [`cdf signout`](#signout) | Logout the currently logged-in user (alias: logout)        |
| [`cdf status`](#status)   | Show user's logged-in status (fails is user not logged in) |

## Data-models (alias: `dm`)

| Data model Commands                                 | Description                                                                                                                                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cdf data-models create`                            | Creates a new data model in CDF that allows you to store and retrieve data to your needs.                                                                                                                                |
| `cdf data-models delete`                            | Deletes a data model stored in CDF (including all its data and versions). This is an irreversible action!                                                                                                                |
| `cdf data-models publish`                           | Updates a data model with a new GraphQL definition. In case of any breaking changes, a new version of the data model will be published. For non-breaking changes, the existing version of the data model will be updated |
| [`cdf data-models generate`](#Data-models-generate) | Generate a GraphQL client code for the schema you provide by fetching the introspection query from the server                                                                                                            |

# Options (Global)

These global `--options` are supported for helping with the executions

| Templates Command | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `--help`          | Show help message and command description                                          |
| `--verbose`       | Show debug logs and detailed message to the users helping with debugging           |
| `--interactive`   | (Default: true) Show prompts rather than failing if required arguments are missing |

# Command Description

## Signin

See the login section for [more details](./LOGIN.md)

```bash
cdf signin
```

```bash
cdf login
```

## Signout

This will logout and clear the global config files for the CLI.

```bash
cdf signout
```

```bash
cdf logout
```

## Status

This command will tell about the login status and later on status of the backend your project is connected to.

```bash
cdf status
```

## Data models generate

This command generates the client side code for the specified project.

Currently following plugins are supported only:

- [typescript](https://www.graphql-code-generator.com/plugins/typescript)
- [typescript-operations](https://www.graphql-code-generator.com/plugins/typescript-operations)
- [typescript-resolvers](https://www.graphql-code-generator.com/plugins/typescript-resolvers)
- [typescript-react-apollo](https://www.graphql-code-generator.com/plugins/typescript-react-apollo)
- [typescript-apollo-angular](https://www.graphql-code-generator.com/plugins/typescript-apollo-angular)

`--operations-file` option will specify which graphql operations to generate hooks, functions for, like certain mutation or query

Example:

```bash
cdf data-models generate --operations-file operations.graphql --plugins typescript typescript-operations
```

# Metrics, Logs and Telemetry

## Update Notifier

We check in background if a newer version of the package is published in `npm` and notify the user about the same if a newer version is available.

> To opt-out set `optOut` to `true` in `~/.config/configstore/update-notifier-@cognite/cdf-cli.json` or set env `NO_UPDATE_NOTIFIER`

## [Contributing to CDF CLI](./CONTRIBUTING.md)

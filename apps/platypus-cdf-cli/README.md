# [Platypus CLI](https://www.npmjs.com/package/@cognite/platypus-cli)

Our aim is to make it easier for application developer to develop app by reducing cost, friction and learning curve for them. Codename Platypus will help us achieve the same.

`NOTE: This package is Alpha version is under active development. Use it on your own risk!`

# Install (Globally)

```
yarn global add @cognite/platypus-cli
```

# Commands

We currently support these top level commands

| Top Level Command            | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| [`platypus login`](#login)   | Login with the CLI                                         |
| [`platypus logout`](#logout) | Logout the currently logged-in user                        |
| [`platypus status`](#status) | Show user's logged-in status (fails is user not logged in) |

## Templates (alias: `t`)

Use templates backend to perform the action there (`cdfrc.json` file is the config file that helps execute the commands)

| Templates Command                            | Description                                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `platypus t init`                            | Init a templates project locally by creating a `cdfrc.json`                                                    |
| `platypus t list`                            | Show list of the templates group's external ids                                                                |
| `platypus t create`                          | create a new template group                                                                                    |
| `platypus t delete`                          | delete some existing templates group                                                                           |
| [`platypus t generate`](#templates-generate) | Generate client side code for the specified templates group and generate typings based on the selected plugins |

### Templates Schema

Operate with `schema` inside templates instance

| Templates Command                | Description                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `platypus t schema pull`         | Pull and override the graphql schema locally based on the version specified in `cdfrc.json` file |
| `platypus t schema publish`      | Publish the local graphql schema file to the backend                                             |
| `platypus t schema version list` |                                                                                                  |

## Solutions (alias: `s`) ![experimental](https://img.shields.io/badge/experimental-red)

Use new schema service backend to perform the action there (`cdfrc.json` file is the config file that helps execute the commands)

| Templates Command                            | Description                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`platypus s generate`](#templates-generate) | Generate client side code for the specified APISpec and generate typings based on the selected plugins |

# Options (Global)

These global `--options` are supported for helping with the executions

| Templates Command  | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `--help`           | Show help message and command description                                |
| `--verbose`        | Show debug logs and detailed message to the users helping with debugging |
| `--no-interactive` | Not show prompts rather fails if required args are missing               |
| `--versions`       | Show the CLI Version                                                     |

# Command Description

## Login

See the login section for [more details](./LOGIN.md)

## Logout

This will logout and clear the global config files for the CLI (not project config use [templates delete](#templates-delete) for that)

```bash
platypus logout
```

## Status

This command will tell about the login status and later on status of the backend your project is connected to.

```bash
platypus status
```

## Templates Generate

This command generates the client side code for the specified project in `cdfrc.json`.

Currently following plugins are supported only:

- [typescript](https://www.graphql-code-generator.com/plugins/typescript)
- [typescript-operations](https://www.graphql-code-generator.com/plugins/typescript-operations)
- [typescript-resolvers](https://www.graphql-code-generator.com/plugins/typescript-resolvers)
- [typescript-react-apollo](https://www.graphql-code-generator.com/plugins/typescript-react-apollo)
- [typescript-apollo-angular](https://www.graphql-code-generator.com/plugins/typescript-apollo-angular)

`--operations-file` option will specify which graphql operations to generate hooks, functions for, like certain mutation or query

Example:

```bash
platypus templates generate --operations-file operations.graphql --plugins typescript typescript-operations
```

# Metrics, Logs and Telemetry

## Update Notifier

We check in background if a newer version of the package is published in `npm` and notify the user about the same if a newer version is available.

> To opt-out set `optOut` to `true` in `~/.config/configstore/update-notifier-@cognite/platypus-cli.json` or set env `NO_UPDATE_NOTIFIER`

# For Developer

You can find the code under `apps/platypus-cdf-cli`.

To build:

`nx build platypus-cdf-cli`

To test:

`nx test platypus-cdf-cli`

To run:

First build the library, then you can

`yarn platypus --help`

# [Platypus CLI](https://www.npmjs.com/package/@cognite/platypus-cli)

[![npm version](https://badgen.net/npm/v/@cognite/platypus-cli)](https://www.npmjs.com/package/@cognite/platypus-cli)

Our aim is to make it easier for application developer to develop app by reducing cost, friction and learning curve for them. Codename Platypus will help us achieve the same.

`NOTE: This package is Alpha version is under active development. Use it on your own risk!`

# Install (Globally)

```
yarn global add @cognite/platypus-cli
```

# Commands

We currently support these commands

## Login

- [Client Credential (**recommended**)](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) mode is designed for long lasting token where you will need to provide `client_id` and `client_secret` for your application, this kind of token are long lasting and meant for machine interactions like CI/CD.

  `platypus login --client-secret=<code>`

> You can obtain your personal `client_secret` by visiting [Azure > App registrations > Platypus: greenfield (staging)](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Credentials/appId/4770c0f1-7bb6-43b5-8c37-94f2a9306757/isMSAApp/) and then go to certificate and secrets and generate your new `client_secret`.

- **Legacy Auth** is supported (but not-recomended), to use legacy auth with `API_KEY` please use the following command

  `platypus login [project_name] --api-key=<api_key>`

  alternatively you can also use

  `API_KEY=<api_key> platypus login [project_name]`

  > by default `[project_name]` is set to `platypus`

## Logout

```bash
platypus logout
```

## Solutions (_currently pointing to templates as default solution provider_)

```bash
platypus solutions list
platypus solutions create <name> [--description=<description>]
platypus solutions delete <id>
```

## Templates

```bash
platypus templates list
platypus templates create <name> [--description=<description>]
platypus templates delete <external_id>
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

## Debug Logs

We use `debug` module to log debug messages.

To view debug messages use this env

`DEBUG=* platypus templates list` will print debug logs (basically verbose)

> How me as developer add debug logs from code.

Inside `handler(arg)` function use `arg.logger.debug(message)` to put debug logs under `platypus-cli:general` namespace, to create your own namespace or to do more [checkout this docs](https://www.npmjs.com/package/debug)

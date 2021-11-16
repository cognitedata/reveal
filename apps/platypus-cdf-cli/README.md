# Platypus CLI

[![npm version](https://badgen.net/npm/v/@cognite/platypus-cli)](https://www.npmjs.com/package/@cognite/platypus-cli)

Our aim is to make it easier for application developer to develop app by reducing cost, friction and learning curve for them. Codename Platypus will help us achieve the same.

`NOTE: This package is Alpha version is under active development. Use it on your own risk!`

# Install

```
npm install -g @cognite/platypus-cli
```

# Login

You can obtain your personal `client_secret` by visiting `Azure > App registrations` and then go to certificate and secrets and generate your new `client_secret`.

```
platypus login --client-secret=<your-client-secret>
```

# Commands

```
platypus templates list
platypus templates create --name=some name --description=some description
platypus templates delete --id=templateGroupId

```

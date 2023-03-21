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

| Data model Commands                                                   | Description                                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `cdf data-models create`                                              | Creates a new data model.                                                                                                       |
| `cdf data-models list`                                                | List data models.                                                                                                               |
| `cdf data-models publish`                                             | Updates a data model with a new GraphQL definition.                                                                             |
| [`cdf dm generate-js-sdk`](#javascript-and-typescript-sdk-generation) | Create a JavaScript (TypeScript) SDK from a data model to query and populate data, with code completion, type checks, and more. |
| [`cdf data-models generate`](#Data-models-generate)                   | Generate a JavaScript GraphQL client for the data model. Powered by https://the-guild.dev/graphql/codegen.                      |

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

## Javascript and Typescript SDK generation

This functionality creates a `FDMQueryClient` that is **auto-generated** from the specified data model which enables **type-safe** CDF data querying and ingestion against your data models.

This tool **reduces boilerplate**. And you can easily use it along side React Query (demo coming soon).

```js
import { FDMQueryClientBuilder } from '@cognite/fdm-client';

const client = FDMQueryClientBuilder.fromClient(/**Your CogniteClient Here**/);
```

Hint: Feel free to checkout the `generated/sample.ts` for how to use the SDK!

### Querying

With FDM, you get access to `list`, `search`, `getById`, and `aggregate` queries for every `type` you define.

To run these queries, use the `runQuery` command and it will autocomplete all of the fields.

#### Basic query with no variables

```js
import { everything } from '@cognite/fdm-client';

client
  .runQuery({
    searchMovie: {
      items: {
        __scalar: true, // use __scalar to get all the scalars back (i.e. String, Int values).
        name: true, // or just type the property name as key and `true` as value to get the data back
      },
    },
  })
  .then((response) => {
    // do something with `response.data`
  });
```

You'll notice that the response you get back is according to the field selection in the `runQuery` command.

#### Basic querying

For most queries, you would like to specify some parameters (i.e. `query` for `search` commands, or `limit` for page size).

Optionally, you can pass arguments for search queries, filters and more directly with `__args`.

Optionally, you can also provide a name to the query via `__name`

```js
client
  .runQuery({
    searchMovie: {
      __name: 'myQuery',
      __args: { query: 'some string', limit: 1000 }, // you can specify the parameters right in here
      items: {
        name: true,
      },
    },
  })
  .then((response) => {
    // do something with `response.data`
  });
```

#### On Interfaces

You can use the `on_XXX` to specify fields for specific types of data you would like back

```js
client
  .runQuery({
    listPerson: {
      __typename: true,
      on_Actor: {
        name: true,
        didWinOscar: true,
      },
    },
  })
  .then(({[account]}) => {
    if (account.__typename === 'Actor') {
      // now account has type Actor
      console.log(account.name);
      console.log(account.id);
    }
  });
```

#### How does it work?

For querying, we take inspiration from [genql](https://github.com/remorses/genql).

### Upserting

To upsert (update or insert) data into your data model's types, you can use `upsertNodes`.

When you upsert, you must specify the `externalId` and any other required fields.

#### Basic Nodes

Loading basic nodes is very easy, simply pass in an array of JSON object after specifying the type that you would like to load to.

```js
await client.upsertNodes('Actor', [
  {
    name: 'Brad Pitt',
    externalId: 'bp',
  },
]);
await client.upsertNodes('Movie', [
  {
    name: "Ocean's 11",
    externalId: 'o11',
  },
]);
```

#### Relationships

We have a special case for any relationships, you must specify the `externalId` of the target instance, along with an _optional_ `space`.

**1:1 (direct) relationships**

Just specify the target directly when updating the instance (node).

```js
import { NodeRef } from '@cognite/fdm-client';

client.upsertNodes('Actor', [
  {
    name: 'Brad Pitt',
    externalId: 'bp',
    favMovie: { externalId: 'o11' },
  },
]);
```

**many to many relationships**

For loading relationships - 1:m (one to many) or m:n (many to many), specify first the property that the data should be loaded to to `upsertEdges`.

Note: you can also supply an `externalId` of the edge itself, or else it will be the combination of the start and end node - `${startNode.externalId}-${endNode.externalId}`.

```js
import { NodeRef } from '@cognite/fdm-client';

client.upsertEdges('Movie', 'actors', [
  {
    startNode: { externalId: 'o11' },
    endNode: { externalId: 'bp' },
  },
]);
```

### Deleting

For deleting nodes data just use the `deleteNodes` and pass in the `externalId`s to be deleted for the specified type.

For deleting relationships - 1:m (one to many) or m:n (many to many), use the special `NodeRef` class and specify the start and end node's `externalId`s. Pass the array of relationships to be deleted to `deleteEdges`.

Note: for relationships (edges), you can also supply an `externalId` of the edge itself, or else it will be the combination of the start and end node - `${startNode.externalId}-${endNode.externalId}`.

```js
import { NodeRef } from '@cognite/fdm-client';
// deleting nodes
client.deleteNodes('Movie', ['bp']);

// deleting relationships
client.deleteEdges('Movie', 'actors', [
  {
    startNode: { externalId: 'o11' },
    endNode: { externalId: 'bp' },
  },
]);
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

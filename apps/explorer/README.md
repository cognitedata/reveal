# Explorer App

This is the office explorer application.
It's purpose is to help you gain insights about the office and navigate from one location to another.

## Local app dev

```
yarn start
```

When you get to the login page, we have a few projects configured for this app you can use.

1.

For `greenfield` use your `cognitedata` account as a guest user in the `fusiondevforcognite.onmicrosoft.com` tenant.

Then select the project `atlas-greenfield`

2.

For `Europe 1 (Google)` use your `reactdemoapp` account.

Then select the project `discover-test-ew1`

## Setting up a project

The following steps detail how to setup a project to have all the data required to run this application.

### Add your models to DMS

1. Send a POST request to `https://{cluster}.cognitedata.com/api/v1/projects/{project}/datamodelstorage/models` with the following body:

```
{
  items: <resources/models/v2.json>,
  spaceExternalId: 'cognite-office-explorer'
}
```

Note:

- if the spaceId is not working or if you need to use v1 endpoints, see [documentation here](https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Data-Model-Storage-API).

### Adding data to database (RAW)

1. Go to `fusion.cognite.com`
2. Click on `Manage staged data`
3. Create a database called `explorer`
4. Create tables and upload information to it through `.csv` files

### Setting up GraphQL server

1. Define in `.env.local` the constants `CLIENT_ID`, `CLIENT_SECRET`, `SCOPE`, `TENANT_ID`, `PROJECT` and `BASE_URL`
2. To start the GraphQL server for the schema, run `yarn graphql:deploy`

### Manually Ingesting Nodes

As of DMS V2, nodes store the data being sent back by the GraphQL server. Thus, if you do not ingest data to nodes, you will not be able to fetch them through GraphQL.

1. POST to `https://{cluster}.cognitedata.com/api/v1/projects/{project}/datamodelstorage/nodes` with

```
{
  spaceExternalId: 'cognite-office-explorer',
  model: [
    'cognite-office-explorer', // this should be the spaceExternalId of where your model lives
    "myModelExternalId"
  ],
  items: <array of items linked with myModel>
}

```

Note:

- the above endpoint only adds nodes unless you specify `overwrite: true` in the body as well. See [documentation](https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Nodes/operation/ingestNodes) for more info.
- For `items`, you'll most likely want to fetch the data you've inserted into `RAW` and turn those into nodes. However, you don't have to.

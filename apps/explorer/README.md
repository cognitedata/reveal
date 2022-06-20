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

There are two steps here, first create a space, and second to add your models into that space.
Model externalIds should be unique in a space

1. Send a POST request to `https://{cluster}.cognitedata.com/api/v1/projects/{project}/datamodelstorage/models` with the following body:

```
{
  items: <resources/models/v2.json>,
  spaceExternalId: 'cognite-office-explorer'
}
```

Note:

- if the spaceId is not working or if you need to use v1 endpoints, see [documentation here](https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Data-Model-Storage-API).

### Adding data to your models

The second step is to ingest some data into your new models.
There are a few ways to do this, putting it directly into the models, or transforming it via RAW (this is most likely how a production system will work)

#### Adding via Raw

1. Go to `fusion.cognite.com`
2. Click on `Manage staged data`
3. Create a database called `explorer`
4. Create tables and upload information to it through `.csv` files

#### Adding directly

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

Notes:

- the above endpoint only adds nodes unless you specify `overwrite: true` in the body as well. See [documentation](https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Nodes/operation/ingestNodes) for more info.
- For `items`, you'll most likely want to fetch the data you've inserted into `RAW` and turn those into nodes. However, you don't have to.
  Note: You can grab a valid Bearer token form a network request on `fusion.cognite.com`

### Setting up GraphQL

After we have models with data in them, we need to setup a GraphQL API to access that data.
Again there are a few steps here:

1. Make the API - where we setup an API namespace to use
2. Create a version - this is an instance in the api that we will query
3. Make bindings to that version

#### Make the API

... todo

1. Define in `.env.local` the constants `CLIENT_ID`, `CLIENT_SECRET`, `SCOPE`, `TENANT_ID`, `PROJECT` and `BASE_URL`
2. To start the GraphQL server for the schema, run `yarn graphql:deploy`

Note: once you have made this, you can see it directly here:

https://graphiql-online.com/

Enter the path:

```
https://{cluster}.cognitedata.com/api/v1/projects/{project}/schema/graphql
```

Here you should be able to see all API's created in a project

### Troubleshooting

#### Incorrect version

If you get this error:

```
  {
    "status": 400,
    "message": "this feature is only available with cdf-version alpha"
  }
```

Then you need to add the alpha flag to any requests:

```
  headers: {
    "cdf-version": "alpha",
  }
```

#### Missing ACL's

If you get this error:

```
  {
    "status": 403,
    "message": "Resource not found. This may also be due to insufficient access rights."
  }
```

Then you need to add the following ACL's to your account:

```
  {
    "experimentAcl": {
      "actions": [
        "USE"
      ],
      "scope": {
        "experimentscope": { "experiments" :  ["schema", "datamodelstorage"]}
      }
    }
  }
```

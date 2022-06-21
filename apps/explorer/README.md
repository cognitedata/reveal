# Explorer App

This is the office explorer application.

It's purpose is to help you gain insights about the office and navigate from one location to another.

## Local app dev

```
yarn start
```

When you get to the login page, we have a few projects configured for this app you can use.

1. For `greenfield` use your `cognitedata` account as a guest user in the `fusiondevforcognite.onmicrosoft.com` tenant.

   - Then select the project `atlas-greenfield`

2. For `bluefield` use your `reactdemoapp` account.

   - Then select the project `discover-test-bluefield`

3. For `Europe 1 (Google)` use your `reactdemoapp` account. (NOT CONFIGURED YET)
   - Then select the project `discover-test-ew1`

## Setting up a new project

The following steps detail how to setup a project to have all the data required to run this application.

### Run the project setup from Fusion Demo Data

... add lines for build and send

### Setting up GraphQL server

1. Define in `.env.local` the constants `CLIENT_ID`, `CLIENT_SECRET`, `SCOPE`, `TENANT_ID`, `PROJECT` and `BASE_URL`
2. To start the GraphQL server for the schema, run `yarn graphql:deploy`

### Generating GraphQL Types

1. Open `resources/codegen.yaml` and replace `${Token}` with a valid bearer token.
2. Go to `applications` folder and run `explorer:graphql-generate`.

### Setting up GraphQL

After we have models with data in them, we need to setup a GraphQL API to access that data.
Again there are a few steps here:

1. Make the API - where we setup an API namespace to use
2. Create a version - this is an instance in the api that we will query

#### Using the API

... todo

1. Define in `.env.local` the constants `CLIENT_ID`, `CLIENT_SECRET`, `SCOPE`, `TENANT_ID`, `PROJECT` and `BASE_URL`
2. To start the GraphQL server for the schema, run `yarn graphql:deploy`

Note: once you have made this, you can see it directly here:

https://graphiql-online.com/

Note: make sure to add the `Authorization` key to the headers and the `Bearer xxx` token.

To see all API's created in a project:

```
https://{cluster}.cognitedata.com/api/v1/projects/{project}/schema/graphql
```

To query a specific API version:

```
https://{cluster}.cognitedata.com/api/v1/projects/{project}/schema/api/{externalId}/{version}/graphql
```

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

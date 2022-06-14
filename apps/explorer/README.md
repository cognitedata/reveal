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

1. Send a POST request to `https://{cluster}.cognitedata.com/api/v1/projects/{project}/datamodelstorage/definitions/apply` with the models from `resources/models/v1.json`

See [documentation here](https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Data-model-query/operation/search).

### Ingesting Data

1. Go to `fusion.cognite.com`
2. Click on `Manage staged data`
3. Create a database called `cognite-office-explorer`
4. Upload information to it through `.csv`

### Setting up GraphQL server

1. Download the repo [schema-demo](https://github.com/cognitedata/schema-demo)
2. Modify the Bearer token as needed to run `yarn deploy`
3. Run `yarn deploy`

Note: You can grab a valid Bearer token form a network request on `fusion.cognite.com`

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

```
yarn build:one --static --directory explorer --folder build_explorer
```

```
yarn send <...credential stuff...> -f build_explorer --dirty
```

### Generating GraphQL Types

This needs to only be run whenever there are schema changes (which live in fusion-demo-data)

1. Open `resources/schema/codegen.yaml` and replace `${Token}` with a valid bearer token.
2. Run `yarn graphql:generate`

#### Using the API

To browse the GraphQL server online, goto: https://graphiql-online.com

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

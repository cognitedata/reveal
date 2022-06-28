# Mock Server

Simple NodeJS mock server that simulates CDF endpoints and can be used for local development or for running E2E tests (UI Tests).

Additionally, we have exposed a middleware that you can use if you have your own NodeJs server.

It is based on `json-server`, but customized to mock the cdf API's and keeps the data in-memory.

`This is a highly experimental mock server and is meant to enable devs to be able to run the app locally without waiting for cdf to be 'ready'. Please use it with care, as we issue no guarantees that it won't break. Have fun!`

# Supported features

- Custom mock data - support for loading mock data from external files.
  - Loading data from JS file
  * `Note: Loading custom mock data is supported only if absolute path is provided because the package is installed globally`

* Basic CDF resources - support for fetching data for basic CDF resources like assets, events, datasets..etc.
  - Basic filtering and pagination is supported
  - Creating and deleting resources has limited support (only basic cases are covered)
  - Files are not supported yet
  - Timeseries have limited support - only basic filtering is supported at the moment, aggregation and more advanced features should come soon
* Templates - support for loading custom templates schema and data
  - Adding new schema via API is supported
  - Querying template groups is supported
  - Quering GraphQL endpoints for template group is supported
    - Pagination is not yet supported
    - Files quering is not supported
    - Timeseries have limited support - only basic queries
  - Relations between custom types and built in types are supported

# Getting started

Install the package

```
npm install -g @cognite/cdf-mock-server
```

Or

```
yarn global add @cognite/cdf-mock-server
```

Create a `db.json` with some data.

`Note: Optionally, you can provide db.js file if you want to generate mock data or have bigger control over your mock data.`

<details>
  <summary>Sample data</summary>

```JSON
{
    "assets": [
        {
            "id": 2113091281838299,
            "externalId": "LOR_NORWAY",
            "name": "Norway",
            "labels": [
                {
                    "externalId": "MOCK_NETWORK_LEVEL_COUNTRY"
                }
            ],
            "metadata": {
                "model_id": "VAL",
                "Network Level": "Country"
            },
            "persistent": true
        },
        {
            "id": 1381646092015199,
            "parentExternalId": "LOR_NORWAY",
            "externalId": "LOR_OSLO",
            "name": "Oslo",
            "labels": [
                {
                    "externalId": "MOCK_NETWORK_LEVEL_PRODUCTION_SYSTEM"
                }
            ],
            "metadata": {
                "Network Level": "Production System"
            }
        }
    ],
    "datasets": [
        {
            "externalId": "MOCK_COMMENTS",
            "name": "MOCK_COMMENTS",
            "description": "MOCK_COMMENTS",
            "id": 3525327311449925
        }
    ],
    "events": [
        {
            "externalId": "60014931",
            "dataSetId": 5147221221011500,
            "startTime": 1613088000000,
            "endTime": 1613088000000,
            "type": "workorder",
            "subtype": "EP02",
            "description": "WELL_02 EXTERNAL VESSEL INSPECTION",
            "metadata": {
                "Functional Location": "LOR_DRAMMEN_WELL_02"
            },
            "assetIds": [
                1813736367545799
            ],
            "source": "sap",
            "id": 6693496708513673,
            "lastUpdatedTime": 1610983084485,
            "createdTime": 1610983084485
        },
        {
            "externalId": "60015664",
            "dataSetId": 5147221221011500,
            "startTime": 1614556800000,
            "endTime": 1614556800000,
            "type": "workorder",
            "subtype": "EP02",
            "description": "Q MPA V-1234 EXTERNAL VESSEL INSPECTION",
            "metadata": {
                "Functional Location": "LOR_DRAMMEN_WELL_02"
            },
            "assetIds": [
                1813736367545799
            ],
            "source": "sap",
            "id": 2632793472586538,
            "lastUpdatedTime": 1610983094180,
            "createdTime": 1610983094180
        }
    ],
    "templategroups": [
        {
            "externalId": "posts-examble",
            "description": "",
            "owners": [],
            "createdTime": 1638531613197,
            "lastUpdatedTime": 1638531613197
        }
    ],
    "templates": [
        {
        "version": 1,
        "createdTime": 1639476522639,
        "lastUpdatedTime": 1639477614908,
        "templategroups_id": "posts-examble",
        "externalId": "posts-examble",
        "schema": "type Post @template {\n    id: Int!\n    title: String!\n    views: Int!\n    user: User\n    comments: [Comment]\n}\n\ntype User @template {\n    id: Int!\n    name: String!\n}\n\ntype Comment @template {\n    id: Int!\n    body: String!\n    date: Int!\n    post: Post\n}",
        "db": {
          "Post": [
            {
              "id": 1,
              "title": "Lorem Ipsum",
              "views": 254,
              "user": {
                "id": 123
              },
              "comments": [
                {
                  "id": 1
                },
                {
                  "id": 2
                }
              ]
            },
            {
              "id": 2,
              "title": "Sic Dolor amet",
              "views": 65,
              "user": {
                "id": 456
              },
              "comments": []
            }
          ],
          "User": [
            {
              "id": 123,
              "name": "John Doe"
            },
            {
              "id": 456,
              "name": "Jane Doe"
            }
          ],
          "Comment": [
            {
              "id": 987,
              "post": {
                "id": 1
              },
              "body": "Consectetur adipiscing elit",
              "date": 1639477614908
            },
            {
              "id": 995,
              "post": {
                "id": 1
              },
              "body": "Nam molestie pellentesque dui",
              "date": 1639477614908
            }
          ]
        }
      }
    ]
}
```

</details>

Start the server

```
cdf-mock-server /absolute/path/to/db.json
```

Open `http://localhost:4002` and you should see that the server is up and running.

# Routes

We are creating the routes based on the `db.json` file that match the Cdf API spec.
For example for `assets`, we will create following routes:

```
POST /api/v1/projects/assets/list
POST /api/v1/projects/assets/search
GET /api/v1/projects/assets/1
POST /api/v1/projects/assets/byids
POST /api/v1/projects/assets
POST /api/v1/projects/assets/delete
```

Please read the [Cognite Documentation](https://docs.cognite.com/api/v1/) how to use this APIs.

Here are few examples how you can query the data

<details>
  <summary>Request examples</summary>

**Events List**

```
curl --location --request POST 'http://localhost:4002/api/v1/projects/events/list' \
--header 'Content-Type: application/json' \
--data-raw '{
  "sort": {
    "endTime": "desc"
  },
  "filter": {
    "assetIds": [
      1813736367545799,
      4127734209801115
    ],
    "type": "workorder",
    "endTime": {
      "min": 1611838577612,
      "max": 1619610977612
    }
  }
}'
```

**Assets Search**

```
curl --location --request POST 'http://localhost:4002/api/v1/projects/assets/search' \
--header 'Content-Type: application/json' \
--data-raw '{
  "filter": {
  },
  "search": {
    "query": "Oslo"
  },
  "limit": 15
}'
```

**Assets ByIds**

```
curl --location --request POST 'http://localhost:4002/api/v1/projects/assets/byids' \
--header 'Content-Type: application/json' \
--data-raw '{
  "items": [
    {
      "id": 3012812817955006
    }
  ]
}'
```

</details>

# Templates APIs

The templates APIs are also mocked. That means that you will be able to create dynamic schemas and run `graphql` queries against locally. The only thing that you will need is to provide mock data.

<details>
  <summary>Example how to create template group and schema</summary>

**To create template group**

```
  curl --location --request POST 'http://localhost:4002/api/v1/projects/templategroups/' \
--header 'Content-Type: application/json' \
--data-raw '{
  "items": [
    {
      "externalId": "templates-schema",
      "description": "test templates-schema"
    }
  ]
}'
```

**To create schema (template)**

```
curl --location --request POST 'http://localhost:4002/api/v1/projects/templategroups/templates-schema/versions/upsert' \
--header 'Content-Type: application/json' \
--data-raw '{
    "items": [
        {
            "version": 1,
            "externalId": "templates-schema",
            "description": "templates-schema",
            "schema": "type Person @template {  firstName: String  lastName: String  email: String  age: Float} type Product @template {  name: String  price: Float  image: String  description: String} type Category  {  name: String  products: [Product]}"
        }
    ]
}'
```

</details>

## Playground

If you use the **Sample mock data** provided above and navigate to `http://localhost:4002/playground#/templates`, you should be able to select your template group and version from drop downs.

The idea with this page is that you are able easily to preview your graphql schemas and run queries against it.

Example graphql query

```
{
  postQuery(filter: { title: { eq: "Sic Dolor amet"} }) {
    items {
      id
      title
      views
      user {
        id
        name
      }
      comments {
       	body
        post {
          title
          id
        }
      }
    }
  }
}
```

# Config

You can provide additional config that can be used to configure or override the mock server.

To pass the config

```
cdf-mock-server --config=config.json
```

Config example:

```JSON
{
    "version": 1,
    "urlRewrites": {
        "/api/v1/projects/*": "/$1",
        "/:resource/list": "/:resource",
        "/:resource/search": "/:resource",
        "/:resource/byids": "/:resource",
        "/templategroups/:templategroups_id/versions/list": "/templates?templategroups_id=:templategroups_id&_sort=version&_order=desc"
    },
    "endpoints": {
        "/api/v1/projects/events/list": {
            "filters": {
                "assetIds": {
                    "rewrite": "assetIds"
                },
                "dataSetIds": {
                    "ignore": true
                }
            }
        }
    }
}
```

Config properties

| Property      | Description                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `urlRewrites` | Use to override routes or register custom route.                                                                                  |
| `endpoints`   | Configure specific API endpoint. You can configure to ignore filters, rewrite request properties, provide your own handler...etc. |

# Add middlewares

You can add your middlewares from the CLI using --middlewares option:

```
cdf-mock-server --middlewares=./custom-middleware.js
```

```JS
// hello.js
module.exports = (req, res, next) => {
  res.header('X-Hello', 'World')
  next()
}
```


# Https

You can run the mock server with HTTPS and then have support for HTTP2

```
cdf-mock-server --secure=true
```

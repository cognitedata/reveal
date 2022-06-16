import fetch from 'node-fetch';

export async function updateApis(apis, token) {
  return runQuery(
    {
      query: `
        mutation upsertApi($apis: [ApiCreate!]!) {
          upsertApis(apis: $apis) {
            externalId
            name
          }
        }
      `,
      variables: {
        apis: apis.map(({ versions: _versions, ...api }) => {
          if (!api.name) {
            return { ...api, name: api.externalId };
          }
          return { ...api };
        }),
      },
    },
    token
  );
}

export async function updateApiVersions(apiVersions, token) {
  return Promise.all(
    apiVersions.map((apiVersion) => updateApiVersion(apiVersion, token))
  );
}

async function updateApiVersion(apiVersion, token) {
  return runQuery(
    {
      query: `
        mutation upsertApiVersion($apiVersion: ApiVersionFromGraphQl!) {
          upsertApiVersionFromGraphQl(apiVersion: $apiVersion) {
            version
            dataModel {
              types {
                name
              }
            }
          }
        }
      `,
      variables: {
        apiVersion,
      },
    },
    token
  );
}

async function runQuery(queryBody, token) {
  const baseUrl = process.env.BASE_URL;
  const project = process.env.PROJECT;
  const schemaUrl = `${baseUrl}/api/v1/projects/${project}/schema/graphql`;

  return fetch(schemaUrl, {
    method: 'POST',
    body: JSON.stringify(queryBody),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.errors) {
        console.error(res.errors);
      }
      return res;
    });
}

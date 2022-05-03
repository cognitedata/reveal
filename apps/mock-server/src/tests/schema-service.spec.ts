import * as request from 'supertest';
import { mockDataSample } from '../mock-data';
import { createServer } from './tests-setup';

describe('SchemaService Solutions Test', () => {
  let server;
  let router;
  let db;

  const createSolutionReq = () => {
    return request(server)
      .post('/schema/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `mutation createUpdateApi($apiCreate: ApiCreate!) {
          upsertApis(apis: [$apiCreate]) {
            externalId
            versions {
              version
              dataModel {
                graphqlRepresentation
              }
            }
          }
        }
        `,
        variables: {
          apiCreate: {
            externalId: 'test-solution',
            name: 'test-solution',
            description: 'Test solution',
          },
        },
      });
  };

  beforeEach(() => {
    db = mockDataSample;

    server = createServer(db, {
      version: 1,
    });
  });

  it('Should fetch the available solutions', async () => {
    const response = await request(server)
      .post('/schema/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `query {
        listApis {
          edges {
            node {
              externalId
              name
              description
              createdTime
            }
          }
        }
    }`,
      });
    const qryResult = response.body;
    const expectedSchema = { ...db.schema[0] };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listApis.edges.length).toBeGreaterThan(1);
    expect(qryResult.data.listApis.edges[0].node).toEqual(
      expect.objectContaining({
        externalId: expectedSchema.externalId,
        name: expectedSchema.name,
      })
    );
  });

  it('Should create new solution', async () => {
    const response = await createSolutionReq();
    const qryResult = response.body;
    const expectedResponse = { externalId: 'test-solution', versions: [] };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.upsertApis.length).toEqual(1);
    expect(qryResult.data.upsertApis[0]).toEqual(expectedResponse);
  });

  it('Should delete solution', async () => {
    const response = await request(server)
      .post('/schema/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `mutation deleteApi($externalId: ID!) {
          deleteApis(externalIds: [$externalId]) {
            externalId
          }
        }`,
        variables: {
          externalId: 'test-solution',
        },
      });
    const qryResult = response.body;
    const expectedResponse = { externalId: 'test-solution' };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.deleteApis.length).toEqual(1);
    expect(qryResult.data.deleteApis[0]).toEqual(expectedResponse);
  });

  it('Should create new solution data model version', async () => {
    const gqlSchema =
      'type Post @view {\n  title: String!\n  views: Int!\n  user: User\n}\n\ntype User @view {\n  name: String!\n}\n\ntype Comment @view {\n  body: String!\n  date: Int!\n  post: Post\n}\n';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const createSolutionResponse = await createSolutionReq();
    const response = await request(server)
      .post('/schema/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `mutation upsertApiVersion($apiVersion: ApiVersionFromGraphQl!) {
          upsertApiVersionFromGraphQl(apiVersion: $apiVersion) {
            version
            createdTime
            dataModel {
              graphqlRepresentation
            }
          }
        }`,
        variables: {
          apiVersion: {
            apiExternalId: 'test-solution',
            graphQl: gqlSchema,
            bindings: [],
            version: 1,
          },
          conflictMode: 'NEW_VERSION',
        },
      });
    const qryResult = response.body;

    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.upsertApiVersionFromGraphQl.version).toEqual(1);
    expect(
      qryResult.data.upsertApiVersionFromGraphQl.dataModel.graphqlRepresentation
    ).toEqual(gqlSchema);
  });
});

import * as request from 'supertest';
import { mockDataSample } from '../mock-data';
import { createServer } from './tests-setup';

describe('MixerApi Test', () => {
  let server;
  let router;
  let db;

  function runRequest(path, query, variables?: any) {
    const payload = {
      query,
    };
    if (variables) {
      payload['variables'] = variables;
    }
    return request(server)
      .post(path)
      .set('Accept', 'application/json')
      .send(payload);
  }

  function buildQuery(filter?: string, body?: string, sort?: string): string {
    const qryFilters = filter ? `(filter: {${filter}})` : '';
    const qryBody = body ? body : 'title';
    const qrySort = sort ? `(sort: { ${sort} })` : '';
    return `query {
      listPost ${qryFilters} ${qrySort} {
        items {
          ${qryBody}
        }
      }
  }`;
  }

  const createDataModelReq = (graphQl?: string) => {
    const reqObj = {
      space: 'test',
      externalId: 'test-solution',
      name: 'test-solution',
      description: 'Test solution',
      version: '1',
    } as any;

    if (graphQl) {
      reqObj.graphQlDml = graphQl;
    }

    return request(server)
      .post('/schema/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `mutation createUpdateDataModel($dmCreate: GraphQlDmlVersionUpsert!) {
          upsertGraphQlDmlVersion(graphQlDmlVersion: $dmCreate) {
            errors {
              message
            }
            result {
              externalId
              version
              graphQlDml
            }
          }
        }
        `,
        variables: {
          dmCreate: {
            space: 'test',
            externalId: 'test-solution',
            name: 'test-solution',
            description: 'Test solution',
            version: '1',
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

  it('Should fetch the available data models', async () => {
    const response = await request(server)
      .post('/schema/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `query {
          listGraphQlDmlVersions(space: "blog") {
            space
            externalId
            version
            name
            description
            graphQlDml
            createdTime
            lastUpdatedTime
        }
    }`,
      });
    const qryResult = response.body;

    // by default, API will return just the latest version
    // since mock
    const expectedSchema = { ...db.datamodels[1] };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listGraphQlDmlVersions.length).toEqual(1);
    expect(qryResult.data.listGraphQlDmlVersions[0]).toEqual(
      expect.objectContaining({
        version: expectedSchema.version,
        externalId: expectedSchema.externalId,
        graphQlDml: expectedSchema.metadata.graphQlDml,
      })
    );
  });

  it('Should create new data model', async () => {
    const response = await createDataModelReq();
    const qryResult = response.body;
    const expectedResponse = {
      externalId: 'test-solution',
      version: '1',
      graphQlDml: null,
    };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.upsertGraphQlDmlVersion.result).toEqual(
      expect.objectContaining(expectedResponse)
    );
  });

  it('Should query applications graphql with nodes and edges', async () => {
    const response = await request(server)
      .post('/schema/api/blog/blog/1/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `query {
        listUser {
          edges {
            node {
              externalId
              name
            }
          }
        }
    }`,
      });
    const qryResult = response.body;
    const expectedResponse = {
      name: 'John Doe',
      externalId: '123',
    };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listUser.edges.length).toEqual(2);
    expect(qryResult.data.listUser.edges[0].node).toEqual(
      expect.objectContaining(expectedResponse)
    );
  });

  it('Should query applications graphql with items', async () => {
    const response = await request(server)
      .post('/schema/api/blog/blog/1/graphql')
      .set('Accept', 'application/json')
      .send({
        query: `query {
        listUser {
          items {
            externalId
            name
          }
        }
    }`,
      });
    const qryResult = response.body;
    const expectedResponse = {
      name: 'John Doe',
      externalId: '123',
    };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listUser.items.length).toEqual(2);
    expect(qryResult.data.listUser.items[0]).toEqual(
      expect.objectContaining(expectedResponse)
    );
  });
});

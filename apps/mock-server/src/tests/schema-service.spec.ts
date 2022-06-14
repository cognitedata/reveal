import * as request from 'supertest';
import { mockDataSample } from '../mock-data';
import { createServer } from './tests-setup';

describe('SchemaService Solutions Test', () => {
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
    expect(qryResult.data.listApis.edges.length).toEqual(1);
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

  it('Should query applications graphql with nodes and edges', async () => {
    const response = await request(server)
      .post('/schema/api/blog/1/graphql')
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
      externalId: '',
    };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listUser.edges.length).toEqual(2);
    expect(qryResult.data.listUser.edges[0].node).toEqual(
      expect.objectContaining(expectedResponse)
    );
  });

  it('Should query applications graphql with items', async () => {
    const response = await request(server)
      .post('/schema/api/blog/1/graphql')
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
      externalId: '',
    };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listUser.items.length).toEqual(2);
    expect(qryResult.data.listUser.items[0]).toEqual(
      expect.objectContaining(expectedResponse)
    );
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

    // after creation the api should be available to run queries
    const apiResponse = await request(server)
      .post('/schema/api/test-solution/1/graphql')
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
    const apiQryResult = apiResponse.body;

    expect(response.statusCode).toEqual(200);
    expect(apiQryResult.data.listUser.edges.length).toEqual(0);
  });

  it('Should handle breaking changes', async () => {
    const gqlSchema =
      'type Post @view {\n  title: Int!\n  views: Int!\n  user: User\n}\n\ntype User @view {\n  name: String!\n}';
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
            apiExternalId: 'blog',
            graphQl: gqlSchema,
            bindings: [],
            version: 1,
          },
          conflictMode: 'PATCH',
        },
      });
    const qryResult = response.body;

    const expectedResponse = {
      errors: [
        {
          message: "Type 'Comment' was removed",
          locations: [
            {
              line: 2,
              column: 11,
            },
          ],
          path: ['upsertApiVersionFromGraphQl'],
          extensions: {
            breakingChangeInfo: {
              currentValue: null,
              previousValue: null,
              typeName: 'Comment',
              typeOfChange: null,
            },
            classification: 'DataFetchingException',
          },
        },
      ],
      data: {
        upsertApiVersionFromGraphQl: null,
      },
    };

    expect(qryResult).toEqual(expectedResponse);
  });

  it('Should filter string fields', async () => {
    const apiPath = '/schema/api/blog/1/graphql';
    // test equal
    let response = await runRequest(
      apiPath,
      buildQuery('title: {eq: "Lorem Ipsum"}')
    );

    let qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(1);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');

    // test in
    response = await runRequest(
      apiPath,
      buildQuery('title: {in: ["Lorem", "Dolor"]}')
    );
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(3);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[1].title).toEqual('Sic Dolor amet');

    // test prefix
    response = await runRequest(apiPath, buildQuery('title: {prefix: "Lor"}'));
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(2);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
  });

  it('Should filter numeric fields', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    let response = await runRequest(apiPath, buildQuery('views: {eq: 254}'));

    let qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(1);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');

    // test lt
    response = await runRequest(apiPath, buildQuery('views: {lt: 200}'));
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(2);
    expect(qryResult.data.listPost.items[0].title).toEqual('Sic Dolor amet');

    // test gt
    response = await runRequest(apiPath, buildQuery('views: {gt: 200}'));
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(1);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');

    // test gte
    response = await runRequest(apiPath, buildQuery('views: {gte: 65}'));
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(3);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[1].title).toEqual('Sic Dolor amet');

    // test lte
    response = await runRequest(apiPath, buildQuery('views: {lte: 254}'));
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(3);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[1].title).toEqual('Sic Dolor amet');

    // test in
    response = await runRequest(apiPath, buildQuery('views: {in: [254, 65]}'));
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(2);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[1].title).toEqual('Sic Dolor amet');
  });

  it('Should do or flter', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('views: {lt: 200}, or: { title: {prefix: "Lorem"} }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(3);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[1].title).toEqual('Sic Dolor amet');
    expect(qryResult.data.listPost.items[2].title).toEqual(
      'Lorem Sic Dolor amet'
    );
  });

  it('Should do and flter', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('views: {lt: 200}, and: { views: {gt: 40} }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(2);
    expect(qryResult.data.listPost.items[0].title).toEqual('Sic Dolor amet');
    expect(qryResult.data.listPost.items[1].title).toEqual(
      'Lorem Sic Dolor amet'
    );
  });

  it('Should query nested objects', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title user { name }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[0].user.name).toEqual('John Doe');
  });

  it('Should query simple lists', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(apiPath, buildQuery('', 'title tags'));

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[0].tags.length).toEqual(2);
    expect(qryResult.data.listPost.items[0].tags[0]).toEqual('Lorem');
  });

  it('Should query lists with relation to other types', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title comments { body }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[0].comments.length).toEqual(2);
    expect(qryResult.data.listPost.items[0].comments[0].body).toEqual(
      'Consectetur adipiscing elit'
    );
  });

  it.skip('Should query inline types', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title metadata { slug }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.listPost.items[0].metadata.slug).toEqual(
      'lorem-ipsum'
    );
  });

  it.skip('Should query list of inline types', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title colors { name }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.listPost.items[0].colors.length).toEqual(1);
    expect(qryResult.data.listPost.items[0].colors[0].name).toEqual('red');
  });

  it('Should filter lists', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery(
        '',
        'title comments(filter: { externalId: { eq: "987"} }) { body }'
      )
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.listPost.items[0].comments.length).toEqual(1);
    expect(qryResult.data.listPost.items[0].comments[0].body).toEqual(
      'Consectetur adipiscing elit'
    );
  });

  it('Should sort lists', async () => {
    const apiPath = '/schema/api/blog/1/graphql';

    // test string sort
    let response = await runRequest(
      apiPath,
      buildQuery('', 'title', 'title: DESC')
    );

    let qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(3);
    expect(qryResult.data.listPost.items[0].title).toEqual('Sic Dolor amet');

    // test numeric sort
    response = await runRequest(
      apiPath,
      buildQuery('', 'title views', 'views: DESC')
    );

    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.listPost.items.length).toEqual(3);
    expect(qryResult.data.listPost.items[0].views).toEqual(254);
  });
});

import * as request from 'supertest';
import { mockDataSample } from '../mock-data';
import { createServer } from './tests-setup';

describe('Templates Test', () => {
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
      postQuery ${qryFilters} ${qrySort} {
        items {
          ${qryBody}
        }
      }
  }`;
  }

  beforeEach(() => {
    db = mockDataSample;

    server = createServer(db, {
      version: 1,
    });
  });

  it('Should fetch the available template groups', async () => {
    const response = await request(server)
      .post('/templategroups/list')
      .set('Accept', 'application/json')
      .send({
        limit: 1000,
      });
    const qryResult = response.body;

    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('BestDay');
  });

  it('Should fetch template groups by ids', async () => {
    const response = await request(server)
      .post('/templategroups/byids')
      .set('Accept', 'application/json')
      .send({
        ignoreUnknownIds: false,
        items: [
          {
            externalId: 'posts-example',
          },
        ],
      });
    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toEqual(1);
    expect(qryResult.items[0].externalId).toEqual('posts-example');
  });

  it('Should fetch template groups by ids', async () => {
    const response = await request(server)
      .post('/templategroups/byids')
      .set('Accept', 'application/json')
      .send({
        ignoreUnknownIds: false,
        items: [
          {
            externalId: 'posts-example',
          },
        ],
      });
    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toEqual(1);
    expect(qryResult.items[0].externalId).toEqual('posts-example');
  });

  it('Should query template version graphql', async () => {
    const apiPath = '/templategroups/posts-example/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title _externalId')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.postQuery.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.data.postQuery.items[0].title).toEqual('Lorem Ipsum');
  });

  it('Should query nested objects', async () => {
    const apiPath = '/templategroups/posts-example/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title user { name }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.postQuery.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.data.postQuery.items[0].title).toEqual('Lorem Ipsum');
    expect(qryResult.data.postQuery.items[0].user.name).toEqual('John Doe');
  });

  it('Should query simple nested lists', async () => {
    const apiPath = '/templategroups/posts-example/versions/1/graphql';
    // test equal
    const response = await runRequest(apiPath, buildQuery('', 'title tags'));

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.postQuery.items.length).toBeGreaterThanOrEqual(1);
    expect(
      qryResult.data.postQuery.items[0].tags.length
    ).toBeGreaterThanOrEqual(1);
    expect(qryResult.data.postQuery.items[0].tags[0]).toEqual('Lorem');
  });

  it('Should query nested lists with relations to other types', async () => {
    const apiPath = '/templategroups/posts-example/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title comments { body }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.postQuery.items.length).toBeGreaterThanOrEqual(1);
    expect(
      qryResult.data.postQuery.items[0].comments.length
    ).toBeGreaterThanOrEqual(1);
    expect(qryResult.data.postQuery.items[0].comments[0].body).toEqual(
      'Consectetur adipiscing elit'
    );
  });

  it('Should query inline types', async () => {
    const apiPath = '/templategroups/posts-example/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title metadata { slug }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.postQuery.items.length).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.postQuery.items[0].metadata.slug).toEqual(
      'lorem-ipsum'
    );
  });

  it('Should query list of inline types', async () => {
    const apiPath = '/templategroups/posts-example/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      buildQuery('', 'title colors { name }')
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.postQuery.items.length).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.postQuery.items[0].colors.length).toEqual(1);
    expect(qryResult.data.postQuery.items[0].colors[0].name).toEqual('red');
  });

  it('Should support timeseries', async () => {
    const apiPath = '/templategroups/BestDay/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      `query {
          wellQuery {
            items {
              mainProduct {
                externalId
                name
                datapoints(start: 1323648000000, end: 1354147200000, limit: 1)  {
                  ... on DatapointString {
                    value
                    stringValue
                    timestamp
                  }
                }

              }
            }
          }
      }`
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.wellQuery.items.length).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.wellQuery.items[0].mainProduct.externalId).toEqual(
      'LOR_OSLO_WELL_01_MAIN_PRODUCT_HISTORY'
    );
    expect(
      qryResult.data.wellQuery.items[0].mainProduct.datapoints.length
    ).toBeGreaterThanOrEqual(1);
    expect(
      qryResult.data.wellQuery.items[0].mainProduct.datapoints[0].stringValue
    ).toEqual('ASSOC_GAS');
  });

  it('Should support quering asset heirarchy', async () => {
    const apiPath = '/templategroups/BestDay/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      `query {
        wellQuery {
          items {
            asset {
                  name
                  externalId
                  root {
                      name
                      externalId
                  }
                  parent {
                      name
                      externalId
                  }
                  metadata {
                      key
                      value
                  }
              }
          }
        }
      }`
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.wellQuery.items.length).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.wellQuery.items[0].asset.externalId).toEqual(
      'LOR_OSLO_WELL_01'
    );
    expect(qryResult.data.wellQuery.items[0].asset.root.externalId).toEqual(
      'LOR_NORWAY'
    );
    expect(qryResult.data.wellQuery.items[0].asset.parent.externalId).toEqual(
      'LOR_OSLO'
    );
    expect(qryResult.data.wellQuery.items[0].asset.metadata[0].key).toEqual(
      'Network Level'
    );
  });

  it('Should support quering nested timeseries 1-many', async () => {
    const apiPath = '/templategroups/BestDay/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      `query {
        wellQuery {
          items {
            products {
              type
              production {
                frequency
                timeSeries {
                  name
                  unit
                  metadata {
                      key
                      value
                  }
                  datapoints {
                      value
                      timestamp
                  }
                }
              }
            }
          }
        }
      }`
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.wellQuery.items.length).toBeGreaterThanOrEqual(1);
    expect(
      qryResult.data.wellQuery.items[0].products.length
    ).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.wellQuery.items[0].products[1].type).toEqual(
      'OIL_test'
    );
    expect(
      qryResult.data.wellQuery.items[0].products[1].production[0].timeSeries
        .name
    ).toEqual('LOR_OSLO_OIL_PRODUCTION');
    expect(
      qryResult.data.wellQuery.items[0].products[1].production[0].timeSeries
        .metadata[0].key
    ).toEqual('product_type');
    expect(
      qryResult.data.wellQuery.items[0].products[1].production[0].timeSeries
        .datapoints[0]
    ).toEqual(
      expect.objectContaining({
        value: 64.727,
        timestamp: 1625702400000,
      })
    );
  });

  it.only('Should support filter datapoints based on start and end', async () => {
    const apiPath = '/templategroups/BestDay/versions/1/graphql';
    // test equal
    const start = 1625788700000;
    const end = 1625961500000;
    const response = await runRequest(
      apiPath,
      `query {
        productQuery(filter: {_externalId: {eq: ["401"]}}) {
          items {
            _externalId
            _dataSetId
            production {
              _externalId
              timeSeries {
                name
                datapoints( limit:200, start: ${start}, end: ${end}) {
                  timestamp
                  value
                }
              }
            }
          }
        }
      }`
    );

    const qryResult = response.body;
    const [productionResult] = qryResult.data.productQuery.items;
    const dataPointsBeforeStart =
      productionResult.production[0].timeSeries.datapoints.filter(
        (it) => +it.timestamp < start
      );
    expect(dataPointsBeforeStart.length).toEqual(0);
    const dataPointsAfterEnd =
      productionResult.production[0].timeSeries.datapoints.filter(
        (it) => +it.timestamp > end
      );
    expect(dataPointsAfterEnd.length).toEqual(0);
  });

  it('Should support aggregation and synthetic timeseries', async () => {
    const apiPath = '/templategroups/BestDay/versions/1/graphql';
    // test equal
    const response = await runRequest(
      apiPath,
      `query {
        productQuery(filter: {_externalId: {eq: ["401"]}}) {
          items {
            _externalId
            _dataSetId
            deferments {

              _externalId
              timeSeries {
                name
                aggregatedDatapoints(granularity: "2d", limit:100) {
                  count {
                    timestamp
                    value
                  }
                }
              }
            }
          }
        }
      }`
    );

    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.data.productQuery.items.length).toBeGreaterThanOrEqual(1);

    expect(qryResult.data.productQuery.items[0]._externalId).toEqual('401');

    expect(
      qryResult.data.productQuery.items[0].deferments.length
    ).toBeGreaterThanOrEqual(1);

    expect(
      qryResult.data.productQuery.items[0].deferments[0].timeSeries.name
    ).toEqual('LOR_OSLO_OIL_DEFERMENTS_ACTUAL');

    expect(
      qryResult.data.productQuery.items[0].deferments[0].timeSeries
        .aggregatedDatapoints.count[0]
    ).toEqual(
      expect.objectContaining({
        timestamp: 1625868000000,
        value: 2,
      })
    );
  });
});

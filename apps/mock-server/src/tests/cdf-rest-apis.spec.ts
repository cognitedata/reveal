import * as request from 'supertest';
import { mockDataSample } from '../mock-data';
import { createServer } from './tests-setup';

describe('CdfRestApis Test', () => {
  let server;
  let router;
  let db;

  beforeEach(() => {
    db = mockDataSample;

    server = createServer(db, {
      version: 1,
    });
  });

  it('Should filter assets', async () => {
    // should list assets
    let response = await request(server)
      .post('/assets/list')
      .set('Accept', 'application/json')
      .send({});
    let qryResult = response.body;

    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('LOR_NORWAY');

    // should filter by parent external ids
    response = await request(server)
      .post('/assets/list')
      .set('Accept', 'application/json')
      .send({
        filter: {
          parentExternalIds: ['LOR_OSLO'],
        },
        limit: 1000,
      });
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('LOR_NORWAY');
    expect(qryResult.items[1].externalId).toEqual('LOR_OSLO');

    // should search assets
    response = await request(server)
      .post('/assets/search')
      .set('Accept', 'application/json')
      .send({
        filter: {
          dataSetIds: [
            {
              externalId: 'BEST_DAY_COMMENTS',
            },
          ],
        },
        search: {
          query: 'Oslo',
        },
        limit: 15,
      });
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('LOR_OSLO');
    expect(qryResult.items[1].externalId).toEqual('LOR_OSLO_WELL_01');

    // should get assets by ids
    response = await request(server)
      .post('/assets/byids')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            id: 1024089787197873,
          },
        ],
      });
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('LOR_OSLO');

    // should get assets by ids
    response = await request(server)
      .post('/assets/byids')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            id: 1024089787197873,
          },
        ],
      });
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('LOR_OSLO');
  });

  it('Should filter timeseries', async () => {
    // should filter by name and other properties
    let response = await request(server)
      .post('/timeseries/list')
      .set('Accept', 'application/json')
      .send({
        filter: {
          name: 'LOR_OSLO_OIL_PRODUCTION',
          unit: 'TONNES',
        },
        limit: 100,
      });
    let qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('LOR_OSLO_OIL_PRODUCTION');

    // should get where root asset id
    // in this case LOR_NORWAY, get all in norway
    response = await request(server)
      .post('/timeseries/list')
      .set('Accept', 'application/json')
      .send({
        filter: {
          rootAssetIds: [2113091281838299],
        },
        limit: 100,
      });
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(3);
    expect(qryResult.items[0].externalId).toEqual('LOR_OSLO_OIL_PRODUCTION');
  });

  it('Should filter files', async () => {
    // should filter by name and other properties
    let response = await request(server)
      .post('/files/list')
      .set('Accept', 'application/json')
      .send({
        filter: {
          rootAssetIds: [1024089787197873],
        },
      });
    let qryResult = response.body;

    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(2);
    expect(qryResult.items[0].externalId).toEqual(
      'fileshare_//mock.com/drawings/MOCK - PID/pnid.pdf'
    );
    expect(qryResult.items[0].metadata.filepath).toEqual(
      'dist/apps/mock-server/pnid.pdf'
    );

    // should return downloadLink
    response = await request(server)
      .post('/files/downloadLink')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            id: 5111311590959999,
          },
        ],
      });
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].downloadUrl).toMatch(
      '/files/gcs_proxy/cognitedata-file-storage/5111311590959999'
    );
  });
});

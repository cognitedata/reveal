import * as request from 'supertest';
import { mockDataSample } from '../mock-data';
import { createServer } from './tests-setup';

describe('DataModelStorageAPI Test', () => {
  let server;
  let router;
  let db;

  beforeEach(() => {
    db = mockDataSample;

    server = createServer(db, {
      version: 1,
    });
  });

  it('Should list spaces', async () => {
    // https://api.cognitedata.com/api/v1/projects/{project}/datamodelstorage/spaces/list
    const response = await request(server)
      .post('/datamodelstorage/spaces/list')
      .set('Accept', 'application/json')
      .send({});
    const qryResult = response.body;
    const expectedResult = { externalId: 'blog' };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0]).toEqual(expect.objectContaining(expectedResult));
  });

  it('Should get spaces byIds', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/byIdsSpaces
    const response = await request(server)
      .post('/datamodelstorage/spaces/byids')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            externalId: 'blog',
          },
        ],
      });
    const qryResult = response.body;
    const expectedResult = { externalId: 'blog' };
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0]).toEqual(expect.objectContaining(expectedResult));
  });

  it('Should add new space', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/applySpaces
    let response = await request(server)
      .post('/datamodelstorage/spaces')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            externalId: 'blog2',
          },
        ],
      });
    let qryResult = response.body;
    expect(response.statusCode).toEqual(201);

    response = await request(server)
      .post('/datamodelstorage/spaces/byids')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            externalId: 'blog2',
          },
        ],
      });
    qryResult = response.body;
    const expectedResult = { externalId: 'blog2' };
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0]).toEqual(expect.objectContaining(expectedResult));
  });

  it('Should add delete space', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/deleteSpaces
    let response = await request(server)
      .post('/datamodelstorage/spaces/delete')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            externalId: 'blog',
          },
        ],
      });
    let qryResult = response.body;
    expect(response.statusCode).toEqual(200);

    response = await request(server)
      .post('/datamodelstorage/spaces/byids')
      .set('Accept', 'application/json')
      .send({
        items: [
          {
            externalId: 'blog',
          },
        ],
      });
    qryResult = response.body;
    expect(qryResult.items.length).toEqual(0);
  });

  it('Should list models', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listModels
    const response = await request(server)
      .post('/datamodelstorage/models/list')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
      });
    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('PostTable');
  });

  it('Should get models by ids', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/byIdsModels
    const response = await request(server)
      .post('/datamodelstorage/models/byids')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
        items: [
          {
            externalId: 'PostTable',
          },
        ],
      });
    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('PostTable');
  });

  it('Should get models by ids', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/byIdsModels
    const response = await request(server)
      .post('/datamodelstorage/models/byids')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
        items: [
          {
            externalId: 'PostTable',
          },
        ],
      });
    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('PostTable');
  });

  it('Should list models', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listModels
    const response = await request(server)
      .post('/datamodelstorage/models/list')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
      });
    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('PostTable');
  });

  it('Should create new models', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/applyModels
    let response = await request(server)
      .post('/datamodelstorage/models')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
        items: [
          {
            externalId: 'UserTable_v2',
            properties: {
              name: {
                type: 'text',
                nullable: false,
              },
            },
          },
        ],
      });
    let qryResult = response.body;
    expect(response.statusCode).toEqual(201);

    response = await request(server)
      .post('/datamodelstorage/models/byids')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
        items: [
          {
            externalId: 'UserTable_v2',
          },
        ],
      });
    qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('UserTable_v2');
  });

  it('Should delete models', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/deleteModels
    let response = await request(server)
      .post('/datamodelstorage/models/delete')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
        items: [
          {
            externalId: 'UserTable',
          },
        ],
      });

    let qryResult = response.body;
    expect(response.statusCode).toEqual(200);

    response = await request(server)
      .post('/datamodelstorage/spaces/byids')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
        items: [
          {
            externalId: 'UserTable',
          },
        ],
      });
    qryResult = response.body;
    expect(qryResult.items.length).toEqual(0);
  });

  it('Should list nodes', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listNodes
    const response = await request(server)
      .post('/datamodelstorage/nodes/list')
      .set('Accept', 'application/json')
      .send({
        model: ['UserTable'],
      });
    const qryResult = response.body;
    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('user_1');
  });

  it('Should search nodes', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listNodes
    const response = await request(server)
      .post('/datamodelstorage/nodes/search')
      .set('Accept', 'application/json')
      .send({
        model: 'UserTable',
        query: 'James',
      });
    const qryResult = response.body;

    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('user_2');
    expect(qryResult.items[0].name).toEqual('James Bond');
  });

  it('Should get nodes by id', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/byIdsNodes
    const response = await request(server)
      .post('/datamodelstorage/nodes/byids')
      .set('Accept', 'application/json')
      .send({
        model: 'UserTable',
        items: [
          {
            externalId: 'user_1',
          },
        ],
      });
    const qryResult = response.body;

    expect(response.statusCode).toEqual(200);
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('user_1');
  });

  it('Should ingest nodes data', async () => {
    // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/ingestNodes
    let response = await request(server)
      .post('/datamodelstorage/nodes')
      .set('Accept', 'application/json')
      .send({
        spaceExternalId: 'blog',
        model: ['UserTable'],
        items: [
          {
            externalId: 'new_user',
            name: 'New User',
          },
        ],
      });
    let qryResult = response.body;

    expect(response.statusCode).toEqual(201);

    response = await request(server)
      .post('/datamodelstorage/nodes/byids')
      .set('Accept', 'application/json')
      .send({
        model: 'UserTable',
        items: [
          {
            externalId: 'new_user',
          },
        ],
      });
    qryResult = response.body;
    expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(qryResult.items[0].externalId).toEqual('new_user');
  });
});

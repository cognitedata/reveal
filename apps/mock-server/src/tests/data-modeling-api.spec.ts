import { fdmViewsMockData } from '@platypus/mock-data';
import * as request from 'supertest';
import { mockDataSample } from '../mock-data';
import { createServer } from './tests-setup';

// https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Spaces-(New)/operation/ApplySpaces
describe('DataModelingAPI Test', () => {
  let server;
  let router;
  let db;

  beforeEach(() => {
    db = mockDataSample;

    server = createServer(db, {
      version: 1,
    });
  });

  describe('Spaces Api', () => {
    const mockDmsSpaceObj = {
      space: 'blog',
      name: 'Blog',
      description: 'Blog space',
    };

    it('Should list spaces', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/spaces
      const response = await request(server)
        .get('/models/spaces')
        .set('Accept', 'application/json')
        .send({});
      const qryResult = response.body;

      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(
        expect.objectContaining(mockDmsSpaceObj)
      );
    });

    it('Should get spaces byIds', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/spaces/byids
      const response = await request(server)
        .post('/models/spaces/byids')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              space: 'blog',
            },
          ],
        });
      const qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(
        expect.objectContaining(mockDmsSpaceObj)
      );
    });

    it('Should Create or update spaces', async () => {
      const newSpace = {
        ...mockDmsSpaceObj,
        space: 'test',
      };

      // https://api.cognitedata.com/api/v1/projects/{project}/models/spaces
      let response = await request(server)
        .post('/models/spaces')
        .set('Accept', 'application/json')
        .send({
          items: [newSpace],
        });
      let qryResult = response.body;
      expect(response.statusCode).toEqual(201);

      response = await request(server)
        .post('/models/spaces/byids')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              space: 'test',
            },
          ],
        });
      qryResult = response.body;
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(expect.objectContaining(newSpace));
    });

    //   it('Should delete space', async () => {
    //     // Delete one or more spaces (limited to 100 at a time).
    //     // Spaces that are referenced by existing data models cannot be deleted.
    //     //Nodes, edges and other data types that are part of a space will also no longer be available.
    //     // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/deleteSpaces
    //     let response = await request(server)
    //       .post('/models/spaces/delete')
    //       .set('Accept', 'application/json')
    //       .send({
    //         items: [
    //           {
    //             space: 'blog',
    //           },
    //         ],
    //       });
    //     let qryResult = response.body;
    //     expect(response.statusCode).toEqual(200);

    //     response = await request(server)
    //       .post('/models/spaces/byids')
    //       .set('Accept', 'application/json')
    //       .send({
    //         items: [
    //           {
    //             space: 'blog',
    //           },
    //         ],
    //       });
    //     qryResult = response.body;
    //     expect(response.statusCode).toEqual(404);
    //     expect(qryResult.items.length).toEqual(0);
    //   });
  });

  //https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Containers-(New)
  describe('Containers Api', () => {
    const mockContainerObj = {
      space: 'blog',
      name: 'Post',
      description: 'The Container for Post',
      externalId: 'PostTable',
      usedFor: 'node',
      properties: {
        title: {
          type: 'text',
          nullable: false,
        },
        views: {
          type: 'int32',
          nullable: false,
        },
        user: {
          type: 'direct_relation',
          nullable: true,
          targetModelExternalId: 'UserTable',
        },
      },
    };

    it('Should list containers', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/containers
      const response = await request(server)
        .get('/models/containers')
        .set('Accept', 'application/json')
        .send({});
      const qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(mockContainerObj);
    });

    it('Should get containers by ids', async () => {
      // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/byIdsModels
      const response = await request(server)
        .post('/models/containers/byids')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              space: 'blog',
              externalId: 'CommentTable',
            },
          ],
        });
      const qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0].externalId).toEqual('CommentTable');
    });

    it('Should create new containers', async () => {
      // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Containers-(New)/operation/ApplyContainers
      let response = await request(server)
        .post('/models/containers')
        .set('Accept', 'application/json')
        .send({
          items: [
            { ...mockContainerObj, externalId: 'TestTable', name: 'Test' },
          ],
        });
      let qryResult = response.body;
      expect(response.statusCode).toEqual(201);

      response = await request(server)
        .post('/models/containers/byids')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              space: 'blog',
              externalId: 'TestTable',
            },
          ],
        });
      qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0].externalId).toEqual('TestTable');
    });

    it('Should delete containers', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/containers/delete
      const reqDto = {
        space: 'blog',
        externalId: 'UserTable',
      };
      let response = await request(server)
        .post('/models/containers/delete')
        .set('Accept', 'application/json')
        .send({
          items: [reqDto],
        });

      let qryResult = response.body;
      expect(response.statusCode).toEqual(200);

      response = await request(server)
        .post('/models/containers/byids')
        .set('Accept', 'application/json')
        .send({
          items: [reqDto],
        });
      qryResult = response.body;
      expect(qryResult.items.length).toEqual(0);
    });
  });

  // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Views-(New)
  describe('Views Api', () => {
    const mockViewObj = {
      space: 'blog',
      externalId: 'Post',
      name: 'Post',
      description: 'Post',
      filter: {},
      implements: [],
      version: '1',
      properties: {
        title: {
          externalId: 'title',
          nullable: true,
          autoIncrement: false,
          defaultValue: '',
          name: 'title',
          description: 'title',
          type: {
            type: 'text',
            list: false,
            collation: 'ucs_basic',
          },
          container: {
            type: 'container',
            space: 'blog',
            externalId: 'PostTable',
          },
          containerPropertyExternalId: 'title',
        },
      },
      usedBy: [],
    };

    it('Should list views', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/views
      // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Views-(New)/operation/listViews
      const response = await request(server)
        .get('/models/views?space=blog')
        .set('Accept', 'application/json')
        .send({});
      const qryResult = response.body;

      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(
        expect.objectContaining({
          externalId: 'Post',
          space: 'blog',
        })
      );
    });

    it('Should get views by ids', async () => {
      // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/byIdsModels
      const response = await request(server)
        .post('/models/views/byids')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              space: 'blog',
              externalId: 'User',
            },
          ],
        });
      const qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0].externalId).toEqual('User');
    });

    it('Should create new views', async () => {
      // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Views-(New)/operation/ApplyViews
      let response = await request(server)
        .post('/models/views')
        .set('Accept', 'application/json')
        .send({
          items: [{ ...mockViewObj, externalId: 'TestView', name: 'Test' }],
        });
      let qryResult = response.body;
      expect(response.statusCode).toEqual(201);

      response = await request(server)
        .post('/models/views/byids')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              space: 'blog',
              externalId: 'TestView',
            },
          ],
        });
      qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0].externalId).toEqual('TestView');
    });

    it('Should delete views', async () => {
      // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Views-(New)/operation/deleteViews
      const reqDto = {
        space: 'blog',
        externalId: 'User',
      };
      let response = await request(server)
        .post('/models/views/delete')
        .set('Accept', 'application/json')
        .send({
          items: [reqDto],
        });

      let qryResult = response.body;
      expect(response.statusCode).toEqual(200);

      response = await request(server)
        .post('/models/views/byids')
        .set('Accept', 'application/json')
        .send({
          items: [reqDto],
        });
      qryResult = response.body;
      expect(qryResult.items.length).toEqual(0);
    });
  });

  // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Data-models
  describe('DataModels Api', () => {
    const mockDataModelObj = {
      space: 'blog',
      externalId: 'blog',
      name: 'blog',
      description: 'blog',
      version: '1',
      metadata: {
        graphQlDml:
          'type Post {\n  title: String!\n  views: Int!\n  user: User\n tags: [String]\n comments: [Comment]\n}\n\ntype User {\n  name: String!\n}\n\ntype Comment {\n  body: String!\n  date: Timestamp!\n  post: Post\n}\n\ntype TypeWithoutData {\n  name: String!\n}',
      },
      createdTime: 1625702400000,
      lastUpdatedTime: 1625702400000,
    };

    it('Should list datamodels', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/views
      // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Views-(New)/operation/listViews
      const response = await request(server)
        .get('/models/datamodels')
        .set('Accept', 'application/json')
        .send({});
      const qryResult = response.body;

      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(
        expect.objectContaining(mockDataModelObj)
      );
    });

    it('Should inline views for datamodels', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/views
      // https://pr-ark-codegen-1771.specs.preview.cogniteapp.com/v1.json.html#tag/Views-(New)/operation/listViews
      const response = await request(server)
        .get('/models/datamodels?inlineViews=true')
        .set('Accept', 'application/json')
        .send({});
      const qryResult = response.body;

      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(
        expect.objectContaining(mockDataModelObj)
      );
      expect(qryResult.items[0].views[0]).toEqual(
        expect.objectContaining(fdmViewsMockData[0]) //Post
      );
    });

    it('Should get datamodels by ids', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/datamodels/byids
      const reqDto = {
        space: 'blog',
        externalId: 'blog',
      };

      const response = await request(server)
        .post('/models/datamodels/byids?inlineViews=true')
        .set('Accept', 'application/json')
        .send({
          items: [reqDto],
        });
      const qryResult = response.body;

      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(
        expect.objectContaining(mockDataModelObj)
      );
      expect(qryResult.items[0].views[0]).toEqual(
        expect.objectContaining(fdmViewsMockData[0]) //Post
      );
    });

    it('Should search datamodels', async () => {
      // https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Data-models/operation/searchDataModels
      // https://api.cognitedata.com/api/v1/projects/{project}/models/datamodels/search
      const reqDto = {
        spaces: ['blog'],
        query: 'lo',
      };

      const response = await request(server)
        .post('/models/datamodels/search')
        .set('Accept', 'application/json')
        .send(reqDto);
      const qryResult = response.body;
      // console.log(qryResult);
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0]).toEqual(
        expect.objectContaining(mockDataModelObj)
      );
    });

    it('Should create new datamodels', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/datamodels
      let response = await request(server)
        .post('/models/datamodels')
        .set('Accept', 'application/json')
        .send({
          items: [
            { ...mockDataModelObj, externalId: 'TestDataModel', name: 'Test' },
          ],
        });
      let qryResult = response.body;
      expect(response.statusCode).toEqual(201);

      response = await request(server)
        .post('/models/datamodels/byids')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              space: 'blog',
              externalId: 'TestDataModel',
            },
          ],
        });
      qryResult = response.body;

      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0].externalId).toEqual('TestDataModel');
    });

    // it('Should delete datamodels', async () => {
    //   // https://api.cognitedata.com/api/v1/projects/{project}/models/datamodels/delete
    //   // https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Data-models/operation/deleteDataModels
    //   const reqDto = {
    //     externalId: 'blog',
    //     space: 'blog',
    //   };
    //   let response = await request(server)
    //     .post('/models/datamodels/delete')
    //     .set('Accept', 'application/json')
    //     .send({
    //       items: [reqDto],
    //     });

    //   let qryResult = response.body;
    //   expect(response.statusCode).toEqual(200);

    //   response = await request(server)
    //     .post('/models/datamodels/byids')
    //     .set('Accept', 'application/json')
    //     .send({
    //       items: [reqDto],
    //     });
    //   qryResult = response.body;
    //   expect(qryResult.items.length).toEqual(0);
    // });
  });

  // https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Instances-(New)/operation/listInstancesV3
  describe('Instances Api', () => {
    const mockInstance = {
      type: 'node',
      space: 'blog',
      container: 'Post',
      createdTime: 1651346026630,
      lastUpdatedTime: 1651346026630,
      properties: {
        blog: {
          Post: {
            externalId: '2',
            title: 'Sic Dolor amet',
            views: 65,
            user: {
              id: 456,
            },
            tags: ['Sic', 'Dolor'],
            comments: [],
          },
        },
      },
    };
    it('Should list instances', async () => {
      // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listNodes
      const response = await request(server)
        .get('/models/instances')
        .set('Accept', 'application/json')
        .send({});
      const qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[1]).toEqual(expect.objectContaining(mockInstance));
    });
    it('Should filter instances', async () => {
      // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listNodes
      const response = await request(server)
        .get('/models/instances?container=Post')
        .set('Accept', 'application/json')
        .send({});
      const qryResult = response.body;
      expect(response.statusCode).toEqual(200);
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[1]).toEqual(expect.objectContaining(mockInstance));
    });

    it('Should ingest instance', async () => {
      // https://api.cognitedata.com/api/v1/projects/{project}/models/instances/ingest
      let response = await request(server)
        .post('/models/instances/ingest')
        .set('Accept', 'application/json')
        .send({
          items: [
            {
              instanceType: 'node',
              space: 'blog',
              externalId: 'new_user',
              containers: [
                {
                  container: {
                    type: 'container',
                    space: 'blog',
                    externalId: 'User',
                  },
                  properties: {
                    name: 'New User',
                  },
                },
              ],
            },
          ],
        });
      let qryResult = response.body;
      // console.log(qryResult);
      expect(response.statusCode).toEqual(200);

      response = await request(server)
        .get('/models/instances?externalId=new_user')
        .set('Accept', 'application/json')
        .send({});
      qryResult = response.body;
      // console.log(JSON.stringify(qryResult, null, 2));`
      expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
      expect(qryResult.items[0].externalId).toEqual('new_user');
      expect(qryResult.items[0].properties.blog.User.name).toEqual('New User');
    });
  });

  // it('Should search nodes', async () => {
  //   // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/listNodes
  //   const response = await request(server)
  //     .post('/datamodelstorage/nodes/search')
  //     .set('Accept', 'application/json')
  //     .send({
  //       model: 'UserTable',
  //       query: 'James',
  //     });
  //   const qryResult = response.body;

  //   expect(response.statusCode).toEqual(200);
  //   expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
  //   expect(qryResult.items[0].externalId).toEqual('user_2');
  //   expect(qryResult.items[0].name).toEqual('James Bond');
  // });

  // it('Should get nodes by id', async () => {
  //   // https://pr-ark-codegen-1692.specs.preview.cogniteapp.com/v1.json.html#operation/byIdsNodes
  //   const response = await request(server)
  //     .post('/datamodelstorage/nodes/byids')
  //     .set('Accept', 'application/json')
  //     .send({
  //       model: 'UserTable',
  //       items: [
  //         {
  //           externalId: 'user_1',
  //         },
  //       ],
  //     });
  //   const qryResult = response.body;

  //   expect(response.statusCode).toEqual(200);
  //   expect(qryResult.items.length).toBeGreaterThanOrEqual(1);
  //   expect(qryResult.items[0].externalId).toEqual('user_1');
  // });
});

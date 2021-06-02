import { rest } from 'msw';
import faker from 'faker';

export const fixtureModelId = faker.datatype.number();
export const fixtureRevisionId = faker.datatype.number();

function getFakeRevision(id) {
  return {
    id,
    fileId: faker.datatype.number(),
    status: 'Done',
    createdTime: faker.time.recent(),
    published: false,
    camera: {},
    metadata: {},
  };
}

export const revisionDetailsMswHandlers = [
  rest.get(`*/3d/models/`, (req, res, ctx) => {
    const threeDModelsFixture = {
      items: [
        {
          id: fixtureModelId,
          createdTime: faker.time.recent(),
          name: 'Model with new and old revisions',
          metadata: {},
        },
      ],
    };
    return res(ctx.json(threeDModelsFixture));
  }),

  rest.get(`*/3d/models/${fixtureModelId}/revisions`, (req, res, ctx) => {
    return res(ctx.json({ items: [getFakeRevision(fixtureRevisionId)] }));
  }),

  rest.get(
    `*/3d/reveal/models/${fixtureModelId}/revisions/${fixtureRevisionId}`,
    (req, res, ctx) => {
      return res(ctx.json({ items: [getFakeRevision(fixtureRevisionId)] }));
    }
  ),

  rest.get(
    `*/3d/models/:modelId/revisions/:revisionId/logs`,
    (req, res, ctx) => {
      return res(ctx.json({ items: [] }));
    }
  ),
];

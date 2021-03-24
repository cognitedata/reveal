import { rest } from 'msw';

import { rootNodeObjRes } from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/rootNodeObjRes';
import { rootNodeChildrenRes } from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/rootNodeChildrenRes';
import { cubeNodeChildrenRes } from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/cubeNodeChildreRes';
import { fakeFirstLevelSiblingsRes } from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/fakeFirstLevelSiblingsRes';
import { cubeNodeFirstChildAncestorsRes } from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/cubeNodeFirstChildAncestorsRes';
import rootNodeIdRes from './fixtures/rootNodeIdRes';
import {
  fixtureCubeNodeFirstChildId,
  fixtureCubeNodeId,
  fixtureModelId,
  fixtureRevisionId,
  fixtureRootNodeId,
} from './fixtures/fixtureConsts';

const onUnhandledRequest = (req, res, ctx) => {
  // eslint-disable-next-line no-console
  console.error(
    `Not mocked API request: ${req.method} ${req.url}${
      req.method === 'POST' ? `\n${JSON.stringify(req.body, null, 2)}` : ''
    }`
  );
  return res(ctx.status(500));
};

// the same handlers can be used both for setupWorker (browser) or setupServer (test env)
export const mswHandlers = [
  rest.post(
    `*/3d/models/${fixtureModelId}/revisions/${fixtureRevisionId}/nodes/internalids/bytreeindices`,
    (req, res, ctx) => {
      return res(ctx.json(rootNodeIdRes));
    }
  ),

  rest.post(
    `*/3d/models/${fixtureModelId}/revisions/${fixtureRevisionId}/nodes/byids`,
    (req, res, ctx) => {
      return res(ctx.json(rootNodeObjRes));
    }
  ),

  rest.get(
    `*/3d/models/${fixtureModelId}/revisions/${fixtureRevisionId}/nodes`,
    (req, res, ctx) => {
      const nodeId = Number(req.url.searchParams.get('nodeId'));
      const cursor = req.url.searchParams.get('cursor');
      const limit = Number(req.url.searchParams.get('limit'));
      if (cursor) {
        return res(ctx.json(fakeFirstLevelSiblingsRes));
      }

      if (nodeId) {
        let fixture;
        if (nodeId === fixtureRootNodeId) {
          fixture = rootNodeChildrenRes;
        } else if (nodeId === fixtureCubeNodeId) {
          fixture = cubeNodeChildrenRes;
        } else {
          return onUnhandledRequest(res, req, ctx);
        }
        if (limit === 1) {
          return res(
            ctx.json({
              items: fixture.items.filter(({ id }) => id === nodeId),
              nextCursor: `fakeCursorFor${nodeId}`,
            })
          );
        }
        return res(ctx.json(fixture));
      }

      return onUnhandledRequest(req, res, ctx);
    }
  ),

  rest.get(
    `*/3d/models/${fixtureModelId}/revisions/${fixtureRevisionId}/nodes/${fixtureCubeNodeFirstChildId}/ancestors`,
    (req, res, ctx) => {
      return res(ctx.json(cubeNodeFirstChildAncestorsRes));
    }
  ),

  rest.get('*', onUnhandledRequest),
  rest.post('*', onUnhandledRequest),
];

import { rest } from 'msw';

import { onUnhandledRequest } from '../../../../../utils/test/mswUtils';

import { cubeNodeChildrenRes } from './fixtures/cubeNodeChildreRes';
import { cubeNodeFirstChildAncestorsRes } from './fixtures/cubeNodeFirstChildAncestorsRes';
import { fakeFirstLevelSiblingsRes } from './fixtures/fakeFirstLevelSiblingsRes';
import {
  fixtureCubeNodeFirstChildId,
  fixtureCubeNodeId,
  fixtureModelId,
  fixtureRevisionId,
  fixtureRootNodeId,
} from './fixtures/fixtureConsts';
import { rootNodeChildrenRes } from './fixtures/rootNodeChildrenRes';
import rootNodeIdRes from './fixtures/rootNodeIdRes';
import { rootNodeObjRes } from './fixtures/rootNodeObjRes';

export const toolbarTreeViewMswHandlers = [
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
          return onUnhandledRequest(req);
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

      return onUnhandledRequest(req);
    }
  ),

  rest.get(
    `*/3d/models/${fixtureModelId}/revisions/${fixtureRevisionId}/nodes/${fixtureCubeNodeFirstChildId}/ancestors`,
    (req, res, ctx) => {
      return res(ctx.json(cubeNodeFirstChildAncestorsRes));
    }
  ),
];

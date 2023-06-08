import { rest } from 'msw';

import { rootNodeObjRes } from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/rootNodeObjRes';
import { rootNodeChildrenRes } from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/rootNodeChildrenRes';
import { cubeNodeChildrenRes } from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/cubeNodeChildreRes';
import { fakeFirstLevelSiblingsRes } from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/fakeFirstLevelSiblingsRes';
import { cubeNodeFirstChildAncestorsRes } from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/cubeNodeFirstChildAncestorsRes';
import { onUnhandledRequest } from '@3d-management/utils/test/mswUtils';
import rootNodeIdRes from './fixtures/rootNodeIdRes';
import {
  fixtureCubeNodeFirstChildId,
  fixtureCubeNodeId,
  fixtureModelId,
  fixtureRevisionId,
  fixtureRootNodeId,
} from './fixtures/fixtureConsts';

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

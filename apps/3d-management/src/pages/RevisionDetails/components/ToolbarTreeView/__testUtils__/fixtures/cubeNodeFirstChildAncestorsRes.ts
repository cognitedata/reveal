import { cubeNodeChildrenRes } from './cubeNodeChildreRes';
import {
  fixtureCubeNodeFirstChildId,
  fixtureCubeNodeId,
} from './fixtureConsts';
import { rootNodeChildrenRes } from './rootNodeChildrenRes';
import { rootNodeObjRes } from './rootNodeObjRes';

export const cubeNodeFirstChildAncestorsRes = {
  items: [
    rootNodeObjRes.items[0],
    rootNodeChildrenRes.items.find(({ id }) => id === fixtureCubeNodeId)!,
    cubeNodeChildrenRes.items.find(
      ({ id }) => id === fixtureCubeNodeFirstChildId
    )!,
  ],
};

import {
  fixtureCubeNodeFirstChildId,
  fixtureCubeNodeId,
} from './fixtureConsts';
import { rootNodeObjRes } from './rootNodeObjRes';
import { rootNodeChildrenRes } from './rootNodeChildrenRes';
import { cubeNodeChildrenRes } from './cubeNodeChildreRes';

export const cubeNodeFirstChildAncestorsRes = {
  items: [
    rootNodeObjRes.items[0],
    rootNodeChildrenRes.items.find(({ id }) => id === fixtureCubeNodeId)!,
    cubeNodeChildrenRes.items.find(
      ({ id }) => id === fixtureCubeNodeFirstChildId
    )!,
  ],
};

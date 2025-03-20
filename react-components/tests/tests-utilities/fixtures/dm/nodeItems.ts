import { COGNITE_CAD_NODE_SOURCE } from "../../../../src/data-providers/core-dm-provider/dataModels";
import { NodeItem } from "../../../../src/data-providers/FdmSDK";

export const object3dIdentifierFixture = { externalId: 'object3d_0', space: 'space0' };

export const cadNodesFixtures: NodeItem[] = [
  {
    externalId: 'cadNode1',
    space: 'space1',
    instanceType: 'node',
    version: 1,
    createdTime: 1620000000000,
    lastUpdatedTime: 1620000001000,
    properties: {
      [COGNITE_CAD_NODE_SOURCE.space]: {
        [`${COGNITE_CAD_NODE_SOURCE.externalId}/${COGNITE_CAD_NODE_SOURCE.version}`]: {
          object3D: object3dIdentifierFixture
        }
      }
    }
  },
  {
    externalId: 'cadNode2',
    space: 'space2',
    instanceType: 'node',
    version: 1,
    createdTime: 1620000002000,
    lastUpdatedTime: 1620000003000,
    properties: {
      [COGNITE_CAD_NODE_SOURCE.space]: {
        [`${COGNITE_CAD_NODE_SOURCE.externalId}/${COGNITE_CAD_NODE_SOURCE.version}`]: {
          object3D: object3dIdentifierFixture
        }
      }
    }
  },
  {
    externalId: 'cadNode3',
    space: 'space3',
    instanceType: 'node',
    version: 1,
    createdTime: 1620000004000,
    lastUpdatedTime: 1620000005000,
    properties: {
      [COGNITE_CAD_NODE_SOURCE.space]: {
        [`${COGNITE_CAD_NODE_SOURCE.externalId}/${COGNITE_CAD_NODE_SOURCE.version}`]: {
          object3D: object3dIdentifierFixture
        }
      }
    }
  }
];
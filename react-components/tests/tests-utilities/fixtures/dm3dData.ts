import {
  COGNITE_CAD_NODE_VIEW_VERSION_KEY,
  COGNITE_IMAGE_360_ANNOTATION_SOURCE,
  COGNITE_IMAGE_360_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY,
  CogniteCADNodeProperties,
  CORE_DM_SPACE
} from '../../../src/data-providers/core-dm-provider/dataModels';
import { DmsUniqueIdentifier, EdgeItem, NodeItem } from '../../../src/data-providers/FdmSDK';
import { restrictToDmsId } from '../../../src/utilities/restrictToDmsId';

export const object3DInstanceFixtures = Array.from(Array(10).keys()).map((n) => ({
  externalId: `object3D_${n}`,
  space: 'space0'
}));

export const cadNodeInstanceFixture0 = {
  externalId: 'cadNodeInstance0',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'node' as const,
  version: 1,
  properties: {
    [CORE_DM_SPACE]: {
      [COGNITE_CAD_NODE_VIEW_VERSION_KEY]: {
        object3D: object3DInstanceFixtures[0]
      }
    }
  }
} as const satisfies NodeItem<{ object3D: DmsUniqueIdentifier }>;

export const cadNodeInstanceFixture1 = {
  externalId: 'cadNodeInstance1',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'node',
  version: 1,
  properties: {
    [CORE_DM_SPACE]: {
      [COGNITE_CAD_NODE_VIEW_VERSION_KEY]: {
        object3D: object3DInstanceFixtures[1]
      }
    }
  }
} as const satisfies NodeItem<{ object3D: DmsUniqueIdentifier }>;

export const cadNodeInstanceFixture2 = {
  externalId: 'cadNodeInstance2',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'node' as const,
  version: 1,
  properties: {
    [CORE_DM_SPACE]: {
      [COGNITE_CAD_NODE_VIEW_VERSION_KEY]: {
        object3D: object3DInstanceFixtures[2]
      }
    }
  }
} as const satisfies NodeItem<{ object3D: DmsUniqueIdentifier }>;

export const pointCloudVolumeInstanceFixture0 = {
  externalId: 'pointCloudInstance0',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'node',
  version: 1,
  properties: {
    [CORE_DM_SPACE]: {
      [COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY]: {
        object3D: object3DInstanceFixtures[3]
      }
    }
  }
} as const satisfies NodeItem<{ object3D: DmsUniqueIdentifier }>;

export const pointCloudVolumeInstanceFixture1 = {
  externalId: 'pointCloudInstance1',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'node',
  version: 1,
  properties: {
    [CORE_DM_SPACE]: {
      [COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY]: {
        object3D: object3DInstanceFixtures[4]
      }
    }
  }
} as const satisfies NodeItem<{ object3D: DmsUniqueIdentifier }>;

export const pointCloudVolumeInstanceFixture2 = {
  externalId: 'pointCloudInstance2',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'node',
  version: 1,
  properties: {
    [CORE_DM_SPACE]: {
      [COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY]: {
        object3D: object3DInstanceFixtures[5]
      }
    }
  }
} as const satisfies NodeItem<{ object3D: DmsUniqueIdentifier }>;

export const image360Collection0 = {
  externalId: 'image360Collection0',
  space: 'space0'
};

export const image360Collection1 = {
  externalId: 'image360Collection1',
  space: 'space0'
};

export const image360Collection2 = {
  externalId: 'image360Collection2',
  space: 'space0'
};

export const image360InstanceFixture0 = {
  externalId: 'image360Instance0',
  space: 'space0',
  instanceType: 'node',
  version: 1,
  createdTime: 0,
  lastUpdatedTime: 0,
  properties: {
    [COGNITE_IMAGE_360_SOURCE.space]: {
      [`${COGNITE_IMAGE_360_SOURCE.externalId}/${COGNITE_IMAGE_360_SOURCE.version}`]: {
        collection360: image360Collection0
      }
    }
  }
} as const satisfies NodeItem;

export const image360InstanceFixture1 = {
  externalId: 'image360Instance1',
  space: 'space0',
  instanceType: 'node',
  version: 1,
  createdTime: 0,
  lastUpdatedTime: 0,
  properties: {
    [COGNITE_IMAGE_360_SOURCE.space]: {
      [`${COGNITE_IMAGE_360_SOURCE.externalId}/${COGNITE_IMAGE_360_SOURCE.version}`]: {
        collection360: image360Collection1
      }
    }
  }
} as const satisfies NodeItem;

export const image360InstanceFixture2 = {
  externalId: 'image360Instance2',
  space: 'space0',
  instanceType: 'node',
  version: 1,
  createdTime: 0,
  lastUpdatedTime: 0,
  properties: {
    [COGNITE_IMAGE_360_SOURCE.space]: {
      [`${COGNITE_IMAGE_360_SOURCE.externalId}/${COGNITE_IMAGE_360_SOURCE.version}`]: {
        collection360: image360Collection2
      }
    }
  }
} as const satisfies NodeItem;

export const image360AnnotationEdgeInstanceFixture0 = {
  startNode: object3DInstanceFixtures[6],
  endNode: restrictToDmsId(image360InstanceFixture0),
  externalId: 'image360AnnotationEdge0',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'edge',
  version: 1,
  properties: {},
  type: restrictToDmsId(COGNITE_IMAGE_360_ANNOTATION_SOURCE)
} as const satisfies EdgeItem;

export const image360AnnotationEdgeInstanceFixture1 = {
  startNode: object3DInstanceFixtures[7],
  endNode: restrictToDmsId(image360InstanceFixture1),
  externalId: 'image360AnnotationEdge1',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'edge',
  version: 1,
  properties: {},
  type: restrictToDmsId(COGNITE_IMAGE_360_ANNOTATION_SOURCE)
} as const satisfies EdgeItem;

export const image360AnnotationEdgeInstanceFixture2 = {
  startNode: object3DInstanceFixtures[8],
  endNode: restrictToDmsId(image360InstanceFixture2),
  externalId: 'image360AnnotationEdge2',
  space: 'space0',
  createdTime: 0,
  lastUpdatedTime: 0,
  instanceType: 'edge',
  version: 1,
  properties: {},
  type: restrictToDmsId(COGNITE_IMAGE_360_ANNOTATION_SOURCE)
} as const satisfies EdgeItem;

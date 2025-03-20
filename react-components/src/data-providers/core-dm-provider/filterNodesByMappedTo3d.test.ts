/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, it } from 'vitest';
import { filterNodesByMappedTo3d } from './filterNodesByMappedTo3d';
import { Mock, It } from 'moq.ts';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type InstancesWithView } from '../../query';
import { type createCheck3dConnectedEquipmentQuery } from './check3dConnectedEquipmentQuery';
import { isEqual } from 'lodash';
import {
  cadNodeInstanceFixture0,
  cadNodeInstanceFixture1,
  cadNodeInstanceFixture2,
  image360AnnotationEdgeInstanceFixture0,
  image360AnnotationEdgeInstanceFixture1,
  image360AnnotationEdgeInstanceFixture2,
  image360InstanceFixture0,
  image360InstanceFixture1,
  image360InstanceFixture2,
  object3DInstanceFixtures,
  pointCloudVolumeInstanceFixture0,
  pointCloudVolumeInstanceFixture1,
  pointCloudVolumeInstanceFixture2
} from '#test-utils/fixtures/dm/object3dData';
import { COGNITE_ASSET_VIEW_VERSION_KEY, CORE_DM_SPACE } from './dataModels';
import { type QueryResult } from '../utils/queryNodesAndEdges';

const modelIdentifier = { externalId: 'model0', space: 'space0' };

const instancesWithView: InstancesWithView[] = [
  {
    view: { externalId: 'CogniteAsset', version: 'v1', space: 'cdf_cdm', type: 'view' },
    instances: [
      {
        externalId: 'asset0',
        space: 'space0',
        instanceType: 'node',
        createdTime: 123,
        lastUpdatedTime: 124,
        version: 1,
        properties: {
          [CORE_DM_SPACE]: {
            [COGNITE_ASSET_VIEW_VERSION_KEY]: {
              object3D: object3DInstanceFixtures[0]
            }
          }
        }
      },
      {
        externalId: 'asset1',
        space: 'space0',
        instanceType: 'node',
        createdTime: 123,
        lastUpdatedTime: 124,
        version: 1,
        properties: {
          [CORE_DM_SPACE]: {
            [COGNITE_ASSET_VIEW_VERSION_KEY]: {
              // This object3D is not contained in any of the used fixtures
              object3D: object3DInstanceFixtures[9]
            }
          }
        }
      }
    ]
  }
];

describe(filterNodesByMappedTo3d.name, () => {
  it('returns empty when no input nodes are provided', async () => {
    const fdmSdkMock = new Mock<FdmSDK>().object();

    const result = await filterNodesByMappedTo3d([], [modelIdentifier], [], fdmSdkMock);

    expect(result).toEqual([]);
  });

  it('returns empty when no input revisions are provided', async () => {
    const fdmSdkMock = new Mock<FdmSDK>().object();
    const result = await filterNodesByMappedTo3d(instancesWithView, [], [], fdmSdkMock);
    expect(result).toEqual([]);
  });

  it('queries API with revisions and returns valid connections from request results', async () => {
    const fdmSdkMock = new Mock<FdmSDK>()
      .setup(
        async (p) =>
          await p.queryAllNodesAndEdges(
            It.Is(
              (
                query: ReturnType<typeof createCheck3dConnectedEquipmentQuery> & {
                  parameters: { revisionRefs: DmsUniqueIdentifier[] };
                }
              ) => isEqual(query.parameters.revisionRefs, [modelIdentifier])
            )
          )
      )
      .returns(
        Promise.resolve({
          items: {
            initial_nodes_cad_nodes: [cadNodeInstanceFixture0],
            initial_nodes_point_cloud_volumes: [pointCloudVolumeInstanceFixture0],
            initial_edges_360_image_annotations: [image360AnnotationEdgeInstanceFixture0],
            initial_nodes_360_images: [image360InstanceFixture0],
            direct_nodes_cad_nodes: [cadNodeInstanceFixture1],
            direct_nodes_point_cloud_volumes: [pointCloudVolumeInstanceFixture1],
            direct_edges_360_image_annotations: [image360AnnotationEdgeInstanceFixture1],
            direct_nodes_360_images: [image360InstanceFixture1],
            indirect_nodes_cad_nodes: [cadNodeInstanceFixture2],
            indirect_nodes_point_cloud_volumes: [pointCloudVolumeInstanceFixture2],
            indirect_edges_360_image_annotations: [image360AnnotationEdgeInstanceFixture2],
            indirect_nodes_360_images: [image360InstanceFixture2]
          }
        } as const satisfies QueryResult<ReturnType<typeof createCheck3dConnectedEquipmentQuery>>)
      );

    const result = await filterNodesByMappedTo3d(
      instancesWithView,
      [modelIdentifier],
      [],
      fdmSdkMock.object()
    );

    expect(result).toEqual([
      {
        ...instancesWithView[0],
        instances: instancesWithView[0].instances.filter(
          (instance) => instance.externalId === 'asset0'
        )
      }
    ]);
  });
});

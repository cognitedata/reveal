/*!
 * Copyright 2023 Cognite AS
 */

import { type Cognite3DViewer, type PointerEventData } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk';
import { type FdmSDK } from '../../utilities/FdmSDK';
import { type FdmAssetMappingsConfig } from '../../hooks/types';
import { type NodeDataResult } from './types';

export async function queryMappedData<NodeType>(
  viewer: Cognite3DViewer,
  cdfClient: CogniteClient,
  fdmClient: FdmSDK,
  fdmConfig: FdmAssetMappingsConfig,
  clickEvent: PointerEventData
): Promise<NodeDataResult<NodeType> | undefined> {
  const intersection = await viewer.getIntersectionFromPixel(
    clickEvent.offsetX,
    clickEvent.offsetY
  );

  if (intersection === null || intersection.type !== 'cad') {
    return;
  }

  const cadIntersection = intersection;
  const model = cadIntersection.model;

  const nodeId = await cadIntersection.model.mapTreeIndexToNodeId(cadIntersection.treeIndex);

  const ancestorNodes = await cdfClient.revisions3D.list3DNodeAncestors(
    model.modelId,
    model.revisionId,
    nodeId
  );

  const ancestorIds = ancestorNodes.items.map((n) => n.id);

  const filter = {
    and: [
      {
        equals: {
          property: ['edge', 'endNode'],
          value: {
            space: fdmConfig.global3dSpace,
            externalId: `model_3d_${model.modelId}`
          }
        }
      },
      {
        equals: {
          property: [
            fdmConfig.source.space,
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
            'revisionId'
          ],
          value: model.revisionId
        }
      },
      {
        in: {
          property: [
            fdmConfig.source.space,
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
            'nodeId'
          ],
          values: ancestorIds
        }
      }
    ]
  };

  const mappings = await fdmClient.filterAllInstances(filter, 'edge', fdmConfig.source);

  if (mappings.edges.length === 0) {
    return;
  }

  const dataNode = mappings.edges[0].startNode;

  const inspectionResult = await fdmClient.inspectInstances({
    inspectionOperations: { involvedViewsAndContainers: {} },
    items: [
      {
        instanceType: 'node',
        externalId: dataNode.externalId,
        space: dataNode.space
      }
    ]
  });

  const dataView =
    inspectionResult.items[0]?.inspectionResults.involvedViewsAndContainers?.views[0];

  if (dataView === undefined) {
    return undefined;
  }

  const dataQueryResult = await fdmClient.filterAllInstances(
    {
      and: [
        { equals: { property: ['node', 'space'], value: dataNode.space } },
        {
          equals: {
            property: ['node', 'externalId'],
            value: dataNode.externalId
          }
        }
      ]
    },
    'node',
    dataView
  );

  const nodeData =
    dataQueryResult.edges[0]?.properties[dataView.space]?.[
      `${dataView.externalId}/${dataView.version}`
    ];

  if (nodeData === undefined) {
    return undefined;
  }

  return { data: nodeData as NodeType, view: dataView };
}

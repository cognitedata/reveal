import { type QueryRequest } from '@cognite/sdk';
import { type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import { type Cognite3DModelProperties, COGNITE_3D_MODEL_SOURCE } from './dataModels';
import { restrictToDmsId } from '../../utilities/restrictToDmsId';

export async function getDMSModels(
  modelId: number,
  fdmSdk: FdmSDK
): Promise<DmsUniqueIdentifier[]> {
  const modelName = `cog_3d_model_${modelId}`;

  const query = {
    select: {
      models: {
        sources: [
          {
            source: COGNITE_3D_MODEL_SOURCE,
            properties: ['name', 'description', 'tags', 'aliases', 'type', 'thumbnail']
          }
        ]
      }
    },
    with: {
      models: {
        nodes: {
          filter: {
            and: [
              {
                equals: { property: ['node', 'externalId'], value: modelName }
              },
              { hasData: [COGNITE_3D_MODEL_SOURCE] }
            ]
          }
        }
      }
    }
  } as const satisfies Omit<QueryRequest, 'cursors' | 'parameters'>;

  const result = await fdmSdk.queryNodesAndEdges<
    typeof query,
    [{ source: typeof COGNITE_3D_MODEL_SOURCE; properties: Cognite3DModelProperties }]
  >(query);

  return result.items.models.map(restrictToDmsId);
}

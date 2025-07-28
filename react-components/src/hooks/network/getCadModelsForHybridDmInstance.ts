import { type CogniteClient } from '@cognite/sdk';
import { type TaggedAddCadResourceOptions } from '../../components/Reveal3DResources/types';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { uniqBy } from 'lodash';
import { createAddOptionsKey } from '../../utilities/createAddOptionsKey';

type CadModelNode = {
  modelId: number;
  revisionId: number;
  nodeId: number;
};

export async function getCadModelsForHybridDmInstance(
  dmsInstance: DmsUniqueIdentifier,
  sdk: CogniteClient
): Promise<TaggedAddCadResourceOptions[]> {
  const result = await sdk.post<{ items: CadModelNode[] }>(
    `api/v1/projects/${sdk.project}/3d/mappings/modelnodes/filter`,
    {
      data: { limit: 1000, filter: { assetInstanceId: dmsInstance } }
    }
  );

  if(result.status !== 200) {
    throw new Error(`Failed to fetch CAD models for DMS instance ${dmsInstance}. Status: ${result.status}`);
  }

  const items: TaggedAddCadResourceOptions[] = result.data.items.map(({ modelId, revisionId }) => ({
    type: 'cad',
    addOptions: { modelId, revisionId }
  }));
  return uniqBy(items, createAddOptionsKey);
}

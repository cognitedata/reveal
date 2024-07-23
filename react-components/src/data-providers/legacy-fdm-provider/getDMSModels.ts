import { DmsUniqueIdentifier, FdmSDK, Source } from '../FdmSDK';
import {
  SYSTEM_SPACE_3D_MODEL_ID,
  SYSTEM_SPACE_3D_MODEL_VERSION,
  SYSTEM_SPACE_3D_SCHEMA
} from './dataModels';

export async function getDMSModels(
  fdmClient: FdmSDK,
  modelId: number
): Promise<DmsUniqueIdentifier[]> {
  const filter = {
    equals: {
      property: ['node', 'externalId'],
      value: `${modelId}`
    }
  };
  const sources: Source = {
    type: 'view',
    space: SYSTEM_SPACE_3D_SCHEMA,
    externalId: SYSTEM_SPACE_3D_MODEL_ID,
    version: SYSTEM_SPACE_3D_MODEL_VERSION
  };

  const modelResults = await fdmClient.filterInstances(filter, 'node', sources);
  return modelResults.instances;
}

import { type FdmSDK } from '../../data-providers/FdmSDK';
import {
  getDMSModelsForIds,
  getDMSRevisionsForRevisionIdsAndModelRefs
} from '../../data-providers/utils/getDMSModelRevisionRefs';
import { tryGetModelIdFromExternalId } from '../../utilities/tryGetModelIdFromExternalId';

export async function getRevisionExternalIdAndSpace(
  modelExternalId: string,
  revisionId: number,
  fdmSdk: FdmSDK
): Promise<{ revisionExternalId: string; revisionSpace: string } | undefined> {
  const isDMModel = modelExternalId.includes('cog_3d_model');
  const modelId = tryGetModelIdFromExternalId(modelExternalId);
  if (!isDMModel || modelId === undefined) {
    return undefined;
  }

  const modelRef = await getDMSModelsForIds([modelId], fdmSdk);
  const revisionRefs = await getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRef,
    [revisionId],
    fdmSdk
  );
  return {
    revisionExternalId: revisionRefs[0].externalId,
    revisionSpace: revisionRefs[0].space
  };
}

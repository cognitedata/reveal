/*!
 * Copyright 2024 Cognite AS
 */

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
  const revisionRef = await getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRef,
    [revisionId],
    fdmSdk
  );
  return {
    revisionExternalId: revisionRef[0].externalId,
    revisionSpace: revisionRef[0].space
  };
}

/*!
 * Copyright 2024 Cognite AS
 */
import { executeParallel } from '../../utilities/executeParallel';
import { isDefined } from '../../utilities/isDefined';
import { getDMSModels } from '../core-dm-provider/getDMSModels';
import { getDMSRevision } from '../core-dm-provider/getDMSRevision';
import { type FdmSDK, type DmsUniqueIdentifier } from '../FdmSDK';

export const MAX_PARALLEL_QUERIES = 2;

export async function getDMSRevisionsForRevisionIdsAndModelRefs(
  modelRefs: Array<DmsUniqueIdentifier | undefined>,
  revisionIds: number[],
  fdmSdk: FdmSDK
): Promise<DmsUniqueIdentifier[]> {
  return (
    await executeParallel(
      revisionIds.map((revisionId, index) => async () => {
        return modelRefs[index] === undefined
          ? undefined
          : await getDMSRevision(modelRefs[index], revisionId, fdmSdk);
      }),
      MAX_PARALLEL_QUERIES
    )
  ).filter(isDefined);
}

export async function getDMSModelsForIds(
  modelIds: number[],
  fdmSdk: FdmSDK
): Promise<DmsUniqueIdentifier[]> {
  return (
    await executeParallel(
      modelIds.map((id) => async () => await getDMSModels(id, fdmSdk)),
      MAX_PARALLEL_QUERIES
    )
  )
    .flat()
    .filter(isDefined);
}

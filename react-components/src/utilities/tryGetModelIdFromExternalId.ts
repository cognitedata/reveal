import { getModelIdFromExternalId as getCoreDmModelIdFromExternalId } from '../data-providers/core-dm-provider/getCdfIdFromExternalId';

export function tryGetModelIdFromExternalId(externalId: string): number | undefined {
  const legacyModelId = Number(externalId);
  if (!isNaN(legacyModelId)) {
    return legacyModelId;
  }

  const coreDmModelId = getCoreDmModelIdFromExternalId(externalId);

  if (!isNaN(coreDmModelId)) {
    return coreDmModelId;
  }

  return undefined;
}

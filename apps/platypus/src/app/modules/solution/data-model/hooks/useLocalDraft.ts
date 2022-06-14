import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { getLocalDraftKey } from '@platypus-app/utils/local-storage-utils';
import { DataModelVersion, StorageProviderType } from '@platypus/platypus-core';

export const useLocalDraft = (solutionId: string) => {
  const DRAFT_KEY = getLocalDraftKey(solutionId);
  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);

  const getLocalDraft = (version: string) => {
    const localDrafts = localStorageProvider.getItem(
      DRAFT_KEY
    ) as DataModelVersion[];
    if (localDrafts && localDrafts.length) {
      return localDrafts.find((draft) => draft.version === version);
    }
    return null;
  };

  const getLocalDrafts = (): DataModelVersion[] => {
    const draftSchema = localStorageProvider.getItem(DRAFT_KEY);
    return draftSchema || [];
  };

  const setLocalDraft = (solutionSchema: DataModelVersion) => {
    const index = getLocalDrafts().findIndex(
      (schema) => schema.version === solutionSchema.version
    );
    const appendedOrReplaced =
      index === -1
        ? [solutionSchema, ...getLocalDrafts()]
        : [
            ...getLocalDrafts().slice(0, index),
            solutionSchema,
            ...getLocalDrafts().slice(index + 1),
          ];
    localStorageProvider.setItem(DRAFT_KEY, appendedOrReplaced);
  };

  const removeLocalDraft = (solutionSchema: DataModelVersion) => {
    const schemas = getLocalDrafts().filter(
      (schema) =>
        schema.version !== solutionSchema.version ||
        schema.status !== solutionSchema.status
    );
    localStorageProvider.setItem(DRAFT_KEY, schemas);
  };

  const getRemoteAndLocalSchemas = (remoteSchemas: DataModelVersion[]) => {
    return [...getLocalDrafts(), ...remoteSchemas].sort((a, b) =>
      b.version.localeCompare(a.version)
    );
  };

  return {
    setLocalDraft,
    getLocalDraft,
    removeLocalDraft,
    getRemoteAndLocalSchemas,
  };
};

import services from '@platypus-app/di';
import { getLocalDraftKey } from '@platypus-app/utils/local-storage-utils';
import { SolutionSchema, StorageProviderType } from '@platypus/platypus-core';

const localStorageProvider = services().storageProviderFactory.getProvider(
  StorageProviderType.localStorage
);

export const useLocalDraft = (solutionId: string) => {
  const DRAFT_KEY = getLocalDraftKey(solutionId);

  const getLocalDraft = (version: string) => {
    const localDrafts = localStorageProvider.getItem(
      DRAFT_KEY
    ) as SolutionSchema[];
    if (localDrafts && localDrafts.length) {
      return localDrafts.find((draft) => draft.version === version);
    }
    return null;
  };

  const getLocalDrafts = (): SolutionSchema[] => {
    const draftSchema = localStorageProvider.getItem(DRAFT_KEY);
    return draftSchema || [];
  };

  const setLocalDraft = (solutionSchema: SolutionSchema) => {
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

  const removeLocalDraft = (solutionSchema: SolutionSchema) => {
    const schemas = getLocalDrafts().filter(
      (schema) =>
        schema.version !== solutionSchema.version ||
        schema.status !== solutionSchema.status
    );
    localStorageProvider.setItem(DRAFT_KEY, schemas);
  };

  const getRemoteAndLocalSchemas = (remoteSchemas: SolutionSchema[]) => {
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

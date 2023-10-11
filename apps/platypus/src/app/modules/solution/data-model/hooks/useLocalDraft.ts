import { DataModelVersion, StorageProviderType } from '@platypus/platypus-core';

import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { getLocalDraftKey } from '../../../../utils/local-storage-utils';

export const useLocalDraft = (
  dataModelId: string,
  dataModelSpace: string,
  latestVersion: DataModelVersion
) => {
  const DRAFT_KEY = getLocalDraftKey(dataModelId, dataModelSpace);
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

  const getLocalDrafts = () => {
    const draftSchema = localStorageProvider.getItem(
      DRAFT_KEY
    ) as DataModelVersion[];
    return (draftSchema || []).filter(
      (draft) => draft.version === latestVersion.version
    );
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

  const removeLocalDraft = (version: string) => {
    const localDrafts = getLocalDrafts().filter(
      (localDraft) => localDraft.version !== version
    );
    localStorageProvider.setItem(DRAFT_KEY, localDrafts);
  };

  const getRemoteAndLocalSchemas = (remoteSchemas: DataModelVersion[]) => {
    return [...getLocalDrafts(), ...remoteSchemas];
  };

  return {
    setLocalDraft,
    getLocalDraft,
    removeLocalDraft,
    getRemoteAndLocalSchemas,
  };
};

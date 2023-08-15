import {
  DataModelVersion,
  DataModelVersionStatus,
  PlatypusError,
} from '@platypus/platypus-core';

import { useContextualizationContext } from './useContextualizationContext';

export const DEFAULT_VERSION_PATH = 'latest';

/*
Given an array of data model versions, return a data model version based on the given
version number which could be a number or an alias like "latest". If no versions exist,
return a default.
*/
export const useSelectedDataModelVersion = (
  selectedVersionNumber: string,
  dataModelExternalId: string,
  space: string
): {
  dataModelVersion: DataModelVersion;
  isLoading: boolean;
  error: PlatypusError | null;
} => {
  const { dataModelVersions } = useContextualizationContext();
  let dataModelVersion;

  // if no published versions, return a default
  if (!dataModelVersions?.length) {
    dataModelVersion = {
      schema: '',
      space,
      externalId: dataModelExternalId,
      status: DataModelVersionStatus.DRAFT,
      version: '1',
      name: '',
      description: '',
      createdTime: Date.now(),
      lastUpdatedTime: Date.now(),
      views: [],
    };
  } else if (selectedVersionNumber === DEFAULT_VERSION_PATH) {
    // if version number is "latest"
    dataModelVersion = dataModelVersions[0];
  } else {
    // else find matching version number
    dataModelVersion = dataModelVersions.find(
      (schema) => schema.version === selectedVersionNumber
    ) as DataModelVersion;
  }

  return {
    dataModelVersion,
    isLoading: false,
    error: null,
  };
};

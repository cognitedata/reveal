import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  PlatypusError,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { KeyValueMap } from '@cognite/cog-data-grid';
import { QueryKeys } from '@platypus-app/utils/queryKeys';

export const usePreviewData = (
  params: {
    dataModelExternalId: string;
    version: string;
    dataModelType: DataModelTypeDefsType;
    dataModelTypeDefs: DataModelTypeDefs;
    externalId: string;
  },
  options?: { enabled?: boolean }
) => {
  const {
    dataModelExternalId,
    version,
    dataModelType,
    dataModelTypeDefs,
    externalId,
  } = params;
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery<KeyValueMap | null>(
    QueryKeys.PREVIEW_DATA(
      dataModelExternalId,
      version,
      dataModelType?.name,
      externalId
    ),
    async () => {
      return await dataManagementHandler
        .fetchData({
          dataModelId: dataModelExternalId,
          cursor: '',
          hasNextPage: false,
          dataModelType: dataModelType,
          dataModelTypeDefs: dataModelTypeDefs,
          version: version,
          limit: 1,
          filter: { externalId: { eq: externalId } },
        })
        .then((response) => {
          return response.getValue().items[0];
        })
        .catch((e) => {
          throw new PlatypusError(
            'Unable to fetch preview data',
            'NOT_FOUND',
            400,
            null,
            e
          );
        });
    },
    options
  );
};

import {
  DataModelTypeDefsType,
  PlatypusValidationError,
  QueryFilter,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { KeyValueMap } from '@cognite/cog-data-grid';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useDataModelTypeDefs } from '@platypus-app/hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { useParams } from 'react-router-dom';

export const usePreviewData = (
  params: {
    dataModelExternalId: string;
    dataModelSpace: string;
    dataModelType: DataModelTypeDefsType;
    externalId: string;
    instanceSpace: string;
    limitFields?: string[];
    nestedFilters?: {
      [x: string]: QueryFilter;
    };
    nestedLimit?: number;
  },
  options?: { enabled?: boolean }
) => {
  const {
    dataModelExternalId,
    dataModelSpace,
    dataModelType,
    externalId,
    instanceSpace,
    limitFields,
    nestedFilters,
    nestedLimit = 10,
  } = params;
  const { version } = useParams() as { version: string };

  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    version,
    dataModelSpace
  );

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, dataModelSpace);

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery<KeyValueMap | null>(
    QueryKeys.PREVIEW_DATA(
      instanceSpace,
      dataModelExternalId,
      dataModelType?.name,
      selectedDataModelVersion.version,
      externalId,
      nestedLimit,
      nestedFilters,
      limitFields
    ),
    async () => {
      return dataManagementHandler
        .getDataById({
          dataModelExternalId,
          dataModelSpace,
          dataModelType,
          dataModelTypeDefs,
          externalId,
          instanceSpace,
          limitFields,
          nestedFilters,
          nestedLimit,
          version: selectedDataModelVersion.version,
        })
        .then((response) => {
          return response.getValue();
        })
        .catch((e) => {
          throw new PlatypusValidationError(
            'Unable to fetch preview data',
            'NOT_FOUND',
            e,
            400,
            null
          );
        });
    },
    {
      ...options,
    }
  );
};

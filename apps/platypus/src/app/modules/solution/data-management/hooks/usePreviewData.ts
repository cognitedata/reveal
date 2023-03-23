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
    dataModelType: DataModelTypeDefsType;
    externalId: string;
    nestedFilters?: {
      [x: string]: QueryFilter;
    };
    limitFields?: string[];
    nestedLimit?: number;
    space: string;
  },
  options?: { enabled?: boolean }
) => {
  const {
    dataModelExternalId,
    dataModelType,
    externalId,
    nestedFilters,
    nestedLimit = 10,
    limitFields,
    space,
  } = params;
  const { version } = useParams() as { version: string };

  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    version,
    space
  );

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery<KeyValueMap | null>(
    QueryKeys.PREVIEW_DATA(
      space,
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
          externalId: externalId,
          nestedFilters,
          dataModelType: dataModelType,
          dataModelTypeDefs: dataModelTypeDefs,
          dataModelVersion: selectedDataModelVersion,
          nestedLimit,
          limitFields,
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

import {
  DataModelTypeDefsType,
  PlatypusValidationError,
  QueryFilter,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';

import { KeyValueMap } from '@cognite/cog-data-grid';

import { useDMContext } from '../../../../context/DMContext';
import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { QueryKeys } from '../../../../utils/queryKeys';

export const usePreviewData = (
  params: {
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
    dataModelType,
    externalId,
    instanceSpace,
    limitFields,
    nestedFilters,
    nestedLimit = 10,
  } = params;

  const {
    typeDefs: dataModelTypeDefs,
    selectedDataModel: selectedDataModelVersion,
  } = useDMContext();

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery<KeyValueMap | null>(
    QueryKeys.PREVIEW_DATA(
      instanceSpace,
      selectedDataModelVersion.externalId,
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
          dataModelExternalId: selectedDataModelVersion.externalId,
          dataModelSpace: selectedDataModelVersion.space,
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

import {
  DataModelTypeDefsType,
  PlatypusError,
  QueryFilter,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';
import { KeyValueMap } from '@cognite/cog-data-grid';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import {
  useDataModel,
  useDataModelTypeDefs,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';

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

  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    selectedVersionNumber,
    space
  );

  const { data: dataModel } = useDataModel(dataModelExternalId, space);
  const { data: dataModelVersions } = useDataModelVersions(
    dataModelExternalId,
    space
  );

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery<KeyValueMap | null>(
    QueryKeys.PREVIEW_DATA(
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
          throw new PlatypusError(
            'Unable to fetch preview data',
            'NOT_FOUND',
            400,
            null,
            e
          );
        });
    },
    {
      ...options,
    }
  );
};

import { DataModelTypeDefsType, PlatypusError } from '@platypus/platypus-core';
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
  },
  options?: { enabled?: boolean }
) => {
  const { dataModelExternalId, dataModelType, externalId } = params;

  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    selectedVersionNumber
  );

  const { data: dataModel } = useDataModel(dataModelExternalId);
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);

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
      selectedDataModelVersion.version,
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
          version: selectedDataModelVersion.version,
          limit: 1,
          space: dataModel?.space || '',
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

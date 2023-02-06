import { TOKENS } from '@platypus-app/di';
import {
  DataModelTypeDefsType,
  FetchPublishedRowsCountDTO,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '../../../../hooks/useInjection';
import { Notification } from '@platypus-app/components/Notification/Notification';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import useSelector from '@platypus-app/hooks/useSelector';
import { QueryKeys } from '@platypus-app/utils/queryKeys';

export const usePublishedRowsCountMapByType = ({
  dataModelExternalId,
  dataModelTypes,
  space,
}: {
  dataModelExternalId: string;
  dataModelTypes: DataModelTypeDefsType[];
  space: string;
}) => {
  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
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
  const dto: FetchPublishedRowsCountDTO = {
    dataModelId: dataModelExternalId,
    dataModelTypes,
    version: selectedDataModelVersion.version,
    space: dataModel?.space || '',
  };

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery(
    QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(dto.dataModelId, dto.dataModelId),
    async () => {
      try {
        const result = await dataManagementHandler.fetchPublishedRowsCount(dto);
        return result.getValue();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (errResponse: any) {
        const error = errResponse.error;
        Notification({
          type: 'error',
          message: error.message,
          validationErrors: error.errors,
        });
        throw errResponse;
      }
    },
    {
      enabled: dataModelTypes.length > 0,
    }
  );
};

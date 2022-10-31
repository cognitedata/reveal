import { TOKENS } from '@platypus-app/di';
import {
  DataModelTypeDefsType,
  FetchPublishedRowsCountDTO,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '../../../../hooks/useInjection';
import { Notification } from '@platypus-app/components/Notification/Notification';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import useSelector from '@platypus-app/hooks/useSelector';
import { QueryKeys } from '@platypus-app/utils/queryKeys';

export const usePublishedRowsCountMapByType = ({
  dataModelExternalId,
  dataModelTypes,
}: {
  dataModelExternalId: string;
  dataModelTypes: DataModelTypeDefsType[];
}) => {
  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);
  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );
  const dto: FetchPublishedRowsCountDTO = {
    dataModelId: dataModelExternalId,
    dataModelTypes,
    version: selectedDataModelVersion.version,
  };

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery(
    QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(dto.dataModelId, dto.dataModelId),
    async () => {
      try {
        const result = await dataManagementHandler.fetchPublishedRowsCount(dto);
        return result.getValue();
      } catch (errResponse: any) {
        const error = errResponse.error;
        Notification({
          type: 'error',
          message: error.message,
          validationErrors: error.errors,
        });
        throw errResponse;
      }
    }
  );
};

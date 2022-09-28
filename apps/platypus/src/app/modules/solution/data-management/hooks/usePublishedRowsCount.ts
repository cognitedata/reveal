import { TOKENS } from '@platypus-app/di';
import { DataModelTypeDefsType, FetchDataDTO } from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '../../../../hooks/useInjection';
import { Notification } from '@platypus-app/components/Notification/Notification';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
  useDataModelTypeDefs,
} from '@platypus-app/hooks/useDataModelActions';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import useSelector from '@platypus-app/hooks/useSelector';
import { QueryKeys } from '@platypus-app/utils/queryKeys';

export const usePublishedRowsCount = ({
  dataModelExternalId,
  dataModelType,
}: {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
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
  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    selectedVersionNumber
  );
  const dto: Omit<FetchDataDTO, 'cursor' | 'hasNextPage' | 'limit'> & {
    dataModelType: DataModelTypeDefsType | null;
  } = {
    dataModelId: dataModelExternalId,
    dataModelTypeDefs,
    dataModelType,
    version: selectedDataModelVersion.version,
  };

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery(
    QueryKeys.PUBLISHED_ROW_COUNT(dto.dataModelId, dto.dataModelType.name),
    async () => {
      try {
        const result = await dataManagementHandler.fetchNumberOfPublishedRows(
          dto
        );
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

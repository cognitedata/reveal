import { TOKENS } from '@platypus-app/di';
import {
  DataModelTypeDefsType,
  FetchPublishedRowsCountDTO,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from '../../../../hooks/useInjection';
import {
  formatValidationErrors,
  Notification,
} from '@platypus-app/components/Notification/Notification';
import { useDataModel } from '@platypus-app/hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useParams } from 'react-router-dom';

export const usePublishedRowsCountMapByType = ({
  dataModelExternalId,
  dataModelTypes,
  space,
}: {
  dataModelExternalId: string;
  dataModelTypes: DataModelTypeDefsType[];
  space: string;
}) => {
  const { version } = useParams() as { version: string };
  const { data: dataModel } = useDataModel(dataModelExternalId, space);

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(
      version,
      dataModelExternalId,
      dataModel?.space || ''
    );
  const dto: FetchPublishedRowsCountDTO = {
    dataModelId: dataModelExternalId,
    dataModelTypes,
    version: selectedDataModelVersion.version,
    space,
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
          extra: formatValidationErrors(error.errors),
        });
        throw errResponse;
      }
    },
    {
      enabled: dataModelTypes.length > 0,
    }
  );
};

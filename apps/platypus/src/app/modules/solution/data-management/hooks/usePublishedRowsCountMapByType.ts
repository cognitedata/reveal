import { useParams } from 'react-router-dom';

import {
  DataModelTypeDefsType,
  FetchPublishedRowsCountDTO,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';

import {
  formatValidationErrors,
  Notification,
} from '../../../../components/Notification/Notification';
import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { useSelectedDataModelVersion } from '../../../../hooks/useSelectedDataModelVersion';
import { QueryKeys } from '../../../../utils/queryKeys';

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

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);
  const dto: FetchPublishedRowsCountDTO = {
    dataModelId: dataModelExternalId,
    dataModelTypes,
    version: selectedDataModelVersion.version,
    space,
  };

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery(
    QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(
      space,
      dto.dataModelId,
      dto.dataModelId
    ),
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

import { FetchPublishedRowsCountDTO } from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';

import {
  formatValidationErrors,
  Notification,
} from '../../../../components/Notification/Notification';
import { useDMContext } from '../../../../context/DMContext';
import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { QueryKeys } from '../../../../utils/queryKeys';
import { isEdgeType } from '../utils';

export const usePublishedRowsCountMapByType = () => {
  const { selectedDataModel, typeDefs } = useDMContext();

  // we cannot aggregate edge types
  const supportedTypes = typeDefs.types.filter((type) => !isEdgeType(type));
  const dto: FetchPublishedRowsCountDTO = {
    dataModelId: selectedDataModel.externalId,
    dataModelTypes: supportedTypes,
    version: selectedDataModel.version,
    space: selectedDataModel.space,
  };

  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  return useQuery(
    QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(
      selectedDataModel.space,
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
      enabled: supportedTypes.length > 0,
    }
  );
};

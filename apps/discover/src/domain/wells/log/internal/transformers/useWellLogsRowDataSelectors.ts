import { keyBySource } from 'modules/wellSearch/utils/groupBySource';

import { useWellLogsRowDataQuery } from '../queries/useWellLogsRowDataQuery';

export const useWellLogsRowDataKeyBySource = (
  sequenceExternalIds: string[] = []
) => {
  const { data, ...rest } = useWellLogsRowDataQuery(sequenceExternalIds);

  return {
    ...rest,
    data: data ? keyBySource(data) : {},
  };
};

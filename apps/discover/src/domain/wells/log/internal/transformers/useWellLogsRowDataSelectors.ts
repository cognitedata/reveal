import { keyBySequence } from 'domain/wells/wellbore/internal/transformers/keyBySequence';

import { useWellLogsRowDataQuery } from '../queries/useWellLogsRowDataQuery';

export const useWellLogsRowDataKeyBySource = (
  sequenceExternalIds: string[] = []
) => {
  const { data, ...rest } = useWellLogsRowDataQuery(sequenceExternalIds);

  return {
    ...rest,
    data: data ? keyBySequence(data) : {},
  };
};

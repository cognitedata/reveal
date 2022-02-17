import { useQueryClient } from 'react-query';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { startLogRowDataFetch } from 'modules/wellSearch/service/sequence/logs';
import { Sequence } from 'modules/wellSearch/types';

import { useWellLogsQuery } from './useWellLogsQuery';
import { useWellboreLogSequenceIdMap } from './useWellLogsQuerySelectors';

export const useFetchWellLogsRowData = () => {
  const queryClient = useQueryClient();
  const { data } = useWellLogsQuery();
  const wellboreLogSequenceIdMap = useWellboreLogSequenceIdMap();
  const wellLogs = data || {};

  return async (sequences: Sequence[]) => {
    const sequencesToFetchRowData = sequences.filter(
      (sequence) =>
        wellboreLogSequenceIdMap[sequence.id] &&
        !wellboreLogSequenceIdMap[sequence.id].rows
    );

    if (isEmpty(sequencesToFetchRowData)) return;

    const sequenceData = await Promise.all(
      sequencesToFetchRowData.map(startLogRowDataFetch)
    );

    sequenceData.forEach((logData) => {
      const { wellboreId } = logData.sequence;
      const newLogList = get(wellLogs, wellboreId, []).map((logRow) =>
        logRow.sequence.id === logData.sequence.id
          ? { ...logRow, rows: logData.rows }
          : logRow
      );
      wellLogs[wellboreId] = newLogList;
    });

    queryClient.setQueryData(WELL_QUERY_KEY.LOGS, wellLogs);
  };
};

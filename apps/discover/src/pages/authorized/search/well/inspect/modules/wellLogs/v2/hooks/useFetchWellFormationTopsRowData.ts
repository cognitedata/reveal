import { useQueryClient } from 'react-query';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { startLogFrmTopsRowDataFetch } from 'modules/wellSearch/service/sequence/logs';
import { Sequence } from 'modules/wellSearch/types';

import { useWellFormationTopsQuery } from './useWellFormationTopsQuery';
import { useWellFormationTopsWellboreIdMap } from './useWellFormationTopsQuerySelectors';

export const useFetchWellFormationTopsRowData = () => {
  const queryClient = useQueryClient();
  const { data } = useWellFormationTopsQuery();
  const wellFormationTopsWellboreIdMap = useWellFormationTopsWellboreIdMap();
  const wellFormationTops = data || {};

  return async (sequences: Sequence[]) => {
    const sequencesToFetchRowData = sequences.filter(
      (sequence) =>
        wellFormationTopsWellboreIdMap[sequence.wellboreId] &&
        !wellFormationTopsWellboreIdMap[sequence.wellboreId].rows
    );

    if (isEmpty(sequencesToFetchRowData)) return;

    const sequenceData = await Promise.all(
      sequences.map(startLogFrmTopsRowDataFetch)
    );

    sequenceData.forEach((logData) => {
      const { wellboreId } = logData.sequence;
      const newLogList = get(wellFormationTops, wellboreId, []).map((logRow) =>
        logRow.sequence.id === logData.sequence.id
          ? { ...logRow, rows: logData.rows }
          : logRow
      );
      wellFormationTops[wellboreId] = newLogList;
    });

    queryClient.setQueryData(WELL_QUERY_KEY.FORMATION_TOPS, wellFormationTops);
  };
};

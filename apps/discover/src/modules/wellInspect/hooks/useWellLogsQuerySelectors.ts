import flatten from 'lodash/flatten';
import get from 'lodash/get';
import { getDateOrDefaultText } from 'utils/date';

import { useDeepMemo } from 'hooks/useDeep';
import { PETREL_LOG_TYPE } from 'modules/wellSearch/constants';
import { Sequence, SequenceData, WellboreId } from 'modules/wellSearch/types';
import { LogTypeData } from 'pages/authorized/search/well/inspect/modules/logType/interfaces';

import {
  useWellInspectSelectedWellboreIds,
  useWellInspectSelectedWells,
} from './useWellInspect';
import { useWellLogsQuery } from './useWellLogsQuery';

export const useSelectedWellboreLogs = () => {
  const wells = useWellInspectSelectedWells();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data, isLoading } = useWellLogsQuery(wellboreIds);

  return useDeepMemo(() => {
    if (!data) {
      return { data: [], isLoading: true };
    }

    const logTypeData: LogTypeData[] = wells.flatMap((well) =>
      well.wellbores.flatMap((wellbore) => {
        return get(data, wellbore.id, [] as SequenceData[]).map(
          (sequenceData) => {
            const { sequence } = sequenceData;
            return {
              ...sequence,
              wellName: well.name,
              wellboreName: wellbore.description || '',
              wellboreId: wellbore.id,
              logType: PETREL_LOG_TYPE,
              modified: getDateOrDefaultText(sequence.lastUpdatedTime),
            };
          }
        );
      })
    );

    return { data: logTypeData, isLoading };
  }, [wellboreIds, data, isLoading]);
};

export const useWellboreLogSequenceIdMap = (
  wellboreIds?: WellboreId[]
): Record<Sequence['id'], SequenceData> => {
  const { data, isLoading } = useWellLogsQuery(wellboreIds);

  return useDeepMemo(() => {
    if (!data) {
      return {};
    }

    return flatten(Object.values(data)).reduce(
      (sequenceIdMap, sequenceData) => ({
        ...sequenceIdMap,
        [sequenceData.sequence.id]: sequenceData,
      }),
      {} as Record<Sequence['id'], SequenceData>
    );
  }, [wellboreIds, data, isLoading]);
};

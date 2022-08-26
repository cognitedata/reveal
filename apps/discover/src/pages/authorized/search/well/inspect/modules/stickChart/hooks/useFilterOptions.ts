import { useNdsEventsQuery } from 'domain/wells/nds/internal/queries/useNdsEventsQuery';
import { adaptNdsEventsToMultiSelect } from 'domain/wells/nds/internal/transformers/adaptNdsEventsToMultiSelect';
import { useNptEventsQuery } from 'domain/wells/npt/internal/queries/useNptEventsQuery';
import { adaptNptEventsToMultiSelect } from 'domain/wells/npt/internal/transformers/adaptNptEventsToMultiSelect';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

export const useFilterOptions = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data: nptEvents = EMPTY_ARRAY } = useNptEventsQuery({ wellboreIds });
  const { data: ndsEvents = EMPTY_ARRAY } = useNdsEventsQuery({ wellboreIds });

  const nptFilterOptions = useDeepMemo(
    () => adaptNptEventsToMultiSelect(nptEvents),
    [nptEvents]
  );

  const ndsFilterOptions = useDeepMemo(
    () => adaptNdsEventsToMultiSelect(ndsEvents),
    [ndsEvents]
  );

  return {
    nptFilterOptions,
    ndsFilterOptions,
  };
};

import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';
import { useNptAggregatesByCodeQuery } from 'domain/wells/npt/internal/queries/useNptAggregatesByCodeQuery';
import { useWellInspectSelectedWellboreNames } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreNames';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import { adaptNptAggregatesDataToView } from '../utils/adaptNptAggregatesDataToView';

export const useNptDataForGraph = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreNames = useWellInspectSelectedWellboreNames();

  const { data = [], isLoading } = useNptAggregatesByCodeQuery({ wellboreIds });
  const { nptCodeDefinitions } = useNptDefinitions();

  const adaptedNptData = useDeepMemo(() => {
    return adaptNptAggregatesDataToView(wellbores, data);
  }, [wellbores, data]);

  return {
    isLoading,
    data: adaptedNptData,
    wellboreNames,
    nptCodeDefinitions,
  };
};

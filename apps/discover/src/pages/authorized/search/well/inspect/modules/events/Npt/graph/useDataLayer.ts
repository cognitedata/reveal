import { mapNptCodeAndDetailCode } from 'dataLayers/wells/npt/adapters/mapNptCodeAndDetailCode';
import { useNptLegendCodeQuery } from 'services/well/legend/npt/useNptLegendQuery';

import { useWellInspectSelectedWellboreNames } from 'modules/wellInspect/hooks/useWellInspect';

import { NptCodeDefinitionType } from '../types';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const wellboreNames = useWellInspectSelectedWellboreNames();

  const nptCodeDefinitions: NptCodeDefinitionType = mapNptCodeAndDetailCode(
    nptCodeLegends?.items
  );

  return { nptCodeDefinitions, wellboreNames };
};

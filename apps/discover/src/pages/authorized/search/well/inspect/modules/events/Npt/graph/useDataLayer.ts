import { useNptLegendCodeQuery } from 'domain/wells/legend/internal/queries/useNptLegendQuery';
import { useWellInspectSelectedWellboreNames } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreNames';

import { mapNptCodeAndDetailCode } from 'dataLayers/wells/npt/adapters/mapNptCodeAndDetailCode';

import { NptCodeDefinitionType } from '../types';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const wellboreNames = useWellInspectSelectedWellboreNames();

  const nptCodeDefinitions: NptCodeDefinitionType = mapNptCodeAndDetailCode(
    nptCodeLegends?.items
  );

  return { nptCodeDefinitions, wellboreNames };
};

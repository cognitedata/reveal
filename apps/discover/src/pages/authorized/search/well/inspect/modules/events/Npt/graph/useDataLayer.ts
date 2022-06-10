import { useNptLegendCodeQuery } from 'domain/wells/legend/internal/queries/useNptLegendQuery';
import { mapNptCodeAndDetailCode } from 'domain/wells/npt/internal/transformers/mapNptCodeAndDetailCode';
import { useWellInspectSelectedWellboreNames } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreNames';

import { NptCodeDefinitionType } from '../types';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const wellboreNames = useWellInspectSelectedWellboreNames();

  const nptCodeDefinitions: NptCodeDefinitionType = mapNptCodeAndDetailCode(
    nptCodeLegends?.items
  );

  return { nptCodeDefinitions, wellboreNames };
};

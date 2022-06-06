import { useNptLegendCodeQuery } from 'domain/wells/legend/internal/queries/useNptLegendQuery';

import { mapNptCodeAndDetailCode } from 'dataLayers/wells/npt/adapters/mapNptCodeAndDetailCode';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const nptCodeDefinitions = mapNptCodeAndDetailCode(nptCodeLegends?.items);

  return { nptCodeDefinitions };
};

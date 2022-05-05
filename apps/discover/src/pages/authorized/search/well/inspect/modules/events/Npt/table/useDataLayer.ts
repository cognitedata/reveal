import { mapNptCodeAndDetailCode } from 'dataLayers/wells/npt/adapters/mapNptCodeAndDetailCode';
import { useNptLegendCodeQuery } from 'services/well/legend/npt/useNptLegendQuery';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const nptCodeDefinitions = mapNptCodeAndDetailCode(nptCodeLegends?.items);

  return { nptCodeDefinitions };
};

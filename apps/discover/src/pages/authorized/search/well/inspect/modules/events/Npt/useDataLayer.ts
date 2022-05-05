import { mapNptCodeAndDetailCode } from 'dataLayers/wells/npt/adapters/mapNptCodeAndDetailCode';
import {
  useNptLegendCodeQuery,
  useNptLegendDetailCodeQuery,
} from 'services/well/legend/npt/useNptLegendQuery';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const { data: nptDetailCodeLegends } = useNptLegendDetailCodeQuery();
  const nptCodeDefinitions = mapNptCodeAndDetailCode(nptCodeLegends?.items);
  const nptDetailCodeDefinitions = mapNptCodeAndDetailCode(
    nptDetailCodeLegends?.items
  );

  return { nptCodeDefinitions, nptDetailCodeDefinitions };
};

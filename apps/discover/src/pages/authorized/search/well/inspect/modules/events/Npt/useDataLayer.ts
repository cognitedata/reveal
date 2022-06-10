import {
  useNptLegendCodeQuery,
  useNptLegendDetailCodeQuery,
} from 'domain/wells/legend/internal/queries/useNptLegendQuery';
import { mapNptCodeAndDetailCode } from 'domain/wells/npt/internal/transformers/mapNptCodeAndDetailCode';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const { data: nptDetailCodeLegends } = useNptLegendDetailCodeQuery();
  const nptCodeDefinitions = mapNptCodeAndDetailCode(nptCodeLegends?.items);
  const nptDetailCodeDefinitions = mapNptCodeAndDetailCode(
    nptDetailCodeLegends?.items
  );

  return { nptCodeDefinitions, nptDetailCodeDefinitions };
};

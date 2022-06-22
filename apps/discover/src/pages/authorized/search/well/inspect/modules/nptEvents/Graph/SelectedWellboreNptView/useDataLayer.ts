import { useNptLegendCodeQuery } from 'domain/wells/legend/internal/queries/useNptLegendQuery';
import { mapNptCodeAndDetailCode } from 'domain/wells/npt/internal/transformers/mapNptCodeAndDetailCode';

export const useDataLayer = () => {
  const { data: nptCodeLegends } = useNptLegendCodeQuery();
  const nptCodeDefinitions = mapNptCodeAndDetailCode(nptCodeLegends?.items);

  return { nptCodeDefinitions };
};

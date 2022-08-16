import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { EMPTY_SUBMENU_OPTIONS } from 'components/Filters/MultiSelectCategorized/views/DropdownMenuOptions';
import { MultiSelectOptionObject } from 'components/Filters/types';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import { useNdsEventsQuery } from '../queries/useNdsEventsQuery';

/**
 * Used together with @see MultiSelectCategorized
 *
 * @returns { 'Casings': [{ value: 'test', checkboxColor: '#fefefe' }], ... }
 */
export const useNdsEventsForMultiSelect = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data } = useNdsEventsQuery({ wellboreIds });

  return useDeepMemo(() => {
    return data?.reduce((accumulator, { riskType, ndsCodeColor, subtype }) => {
      if (!riskType) return accumulator;

      const ndsDetailCodesBag = (accumulator[riskType] ||
        []) as MultiSelectOptionObject[];

      const hasNptCodeDetail = ndsDetailCodesBag.some(
        (item) => item.value === (subtype || EMPTY_SUBMENU_OPTIONS)
      );

      if (hasNptCodeDetail) {
        return accumulator;
      }

      const uniqueNptCodeDetails: MultiSelectOptionObject = {
        checkboxColor: ndsCodeColor,
        value: subtype || EMPTY_SUBMENU_OPTIONS,
      };

      return {
        ...accumulator,
        [riskType]: [...ndsDetailCodesBag, uniqueNptCodeDetails],
      };
    }, {} as MultiSelectCategorizedOptionMap);
  }, [data]);
};

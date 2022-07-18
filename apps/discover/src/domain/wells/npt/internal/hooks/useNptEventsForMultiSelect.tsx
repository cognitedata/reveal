import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';

import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { EMPTY_SUBMENU_OPTIONS } from 'components/Filters/MultiSelectCategorized/views/DropdownMenuOptions';
import { MultiSelectOptionObject } from 'components/Filters/types';
import { useDeepMemo } from 'hooks/useDeep';

import { useNptEventsQuery } from '../queries/useNptEventsQuery';

/**
 * Used together with @see MultiSelectCategorized
 *
 * @returns { 'WAIT': [{ value: 'LGST', checkboxColor: '#fefefe' }], ... }
 */
export const useNptEventsForMultiSelect = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data } = useNptEventsQuery({ wellboreIds });

  return useDeepMemo(() => {
    return data?.reduce(
      (accumulator, { nptCode, nptCodeColor, nptCodeDetail }) => {
        const nptDetailCodesBag = (accumulator[nptCode] ||
          []) as MultiSelectOptionObject[];

        const hasNptCodeDetail = nptDetailCodesBag.some(
          (item) => item.value === (nptCodeDetail || EMPTY_SUBMENU_OPTIONS)
        );

        if (hasNptCodeDetail) {
          return accumulator;
        }

        const uniqueNptCodeDetails: MultiSelectOptionObject = {
          checkboxColor: nptCodeColor,
          value: nptCodeDetail || EMPTY_SUBMENU_OPTIONS,
        };

        return {
          ...accumulator,
          [nptCode]: [...nptDetailCodesBag, uniqueNptCodeDetails],
        };
      },
      {} as MultiSelectCategorizedOptionMap
    );
  }, [data]);
};

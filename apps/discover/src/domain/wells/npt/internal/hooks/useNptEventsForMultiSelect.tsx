import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';

import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { EMPTY_SUBMENU_OPTIONS } from 'components/Filters/MultiSelectCategorized/views/DropdownMenuOptions';
import { MultiSelectOptionObject } from 'components/Filters/types';
import { useDeepMemo } from 'hooks/useDeep';
import { Definition } from 'pages/authorized/search/well/inspect/modules/nptEvents/components/Definition';
import { NoCodeDefinition } from 'pages/authorized/search/well/inspect/modules/nptEvents/components/NoCodeDefinition';
import { useNptData } from 'pages/authorized/search/well/inspect/modules/nptEvents/hooks/useNptData';

import { useNptEventsQuery } from '../queries/useNptEventsQuery';
import { getCodeDefinition } from '../selectors/getCodeDefinition';

/**
 * Used together with @see MultiSelectCategorized
 *
 * @returns { 'WAIT': [{ value: 'LGST', checkboxColor: '#fefefe' }], ... }
 */
export const useNptEventsForMultiSelect = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { nptCodeDefinitions } = useNptData();

  const { data } = useNptEventsQuery({ wellboreIds });

  return useDeepMemo(() => {
    return data?.reduce(
      (accumulator, { nptCode, nptCodeColor, nptCodeDetail }) => {
        const codeDefinition: string = getCodeDefinition(
          nptCode,
          nptCodeDefinitions
        );

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
          helpText: codeDefinition ? (
            <Definition definition={codeDefinition} />
          ) : (
            <NoCodeDefinition />
          ),
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

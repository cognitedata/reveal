/*
 * https://react-redux.js.org/api/hooks#using-memoizing-selectors : As per this doc
 * using reselect selector & useSelect in combination for memoizing results
 * */

import React from 'react';

import { useExternalLinksConfig } from 'hooks/useExternalLinksConfig';
import useSelector from 'hooks/useSelector';
import { WELL_FIELDS_WITH_PRODUCTION_DATA } from 'modules/wellSearch/constants';
import {
  useWellQueryResultSelectedWells,
  useWellQueryResultWells,
} from 'modules/wellSearch/hooks/useWellQueryResultSelectors';

import { useEnabledWellSdkV3 } from '../../hooks/useEnabledWellSdkV3';

import {
  selectedWellIdsSelector,
  intermediateWellsSelector,
} from './wellSelectors';

export const useWells = () => {
  return useSelector((state) => state.wellSearch);
};

// @sdk-wells-v3
export const useSelectedWellIds = () => {
  const enabledWellSDKV3 = useEnabledWellSdkV3();
  return useSelector((state) =>
    selectedWellIdsSelector(state, enabledWellSDKV3)
  );
};

export const useIndeterminateWells = () => {
  const wells = useWellQueryResultWells();
  return useSelector((state) => intermediateWellsSelector(state, wells));
};

// This returns external links based on the selected wells
export const useExternalLinkFromSelectedWells = (): string[] => {
  const selectedWells = useWellQueryResultSelectedWells();
  const tenantConfigExternalLinks = useExternalLinksConfig();

  return React.useMemo(() => {
    const externalLinks: string[] = [];

    if (tenantConfigExternalLinks) {
      selectedWells.forEach((well) => {
        if (
          well.name === '34/7-G-4' &&
          tenantConfigExternalLinks.hasWellProductionData
        ) {
          externalLinks.push(tenantConfigExternalLinks.hasWellProductionData());
        }

        /**
         * NOTE: the field prop is not in the type but is delivered by backend.
         * I didn't know which type to change at this point and this solution is
         * temporarily so I ts-ignored it - Samir
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { field } = well;
        if (
          field &&
          WELL_FIELDS_WITH_PRODUCTION_DATA.includes(field) &&
          tenantConfigExternalLinks.hasProductionData
        ) {
          externalLinks.push(
            tenantConfigExternalLinks.hasProductionData(field)
          );
        }
      });
    }

    // filter out duplicates
    return Array.from(new Set(externalLinks)) || [];
  }, [selectedWells, tenantConfigExternalLinks]);
};

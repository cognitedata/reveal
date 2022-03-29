import { useMemo } from 'react';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { FilterConfig } from 'modules/wellSearch/types';
import { filterConfigs } from 'pages/authorized/search/search/SideBar/filters/well/filters';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';

export const useFilterConfigByCategory = () => {
  const { data: config } = useWellConfig();

  const enabledWellSDKV3 = useEnabledWellSdkV3();

  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useMemo(() => {
    const filteredConfigData = filterConfigs(
      userPreferredUnit,
      config?.well_characteristics_filter?.dls
    )
      .filter((item) => {
        if (enabledWellSDKV3) {
          // if this is explicitly disabled, then don't show the filter
          if (item.enableOnlySdkV3 === false) {
            return false;
          }

          return true;
        }

        // if this is explicitly disabled, then don't show the filter
        if (item.enableOnlySdkV3 === true) {
          return false;
        }

        return true;
      })
      .filter((item) => {
        if (!item.key) return true;
        // when we add data_availabilty into project config
        // we can change this back to:
        // const filterItem = get(config, item.key);
        const filterItem = get(
          {
            ...config,
            data_availabilty: {
              enabled: true,
            },
          },
          item.key
        );
        return filterItem?.enabled;
      });

    return filterCategoricalData(filteredConfigData);
  }, [config, userPreferredUnit, enabledWellSDKV3]);
};

export const filterCategoricalData = (filteredConfigData: FilterConfig[]) => {
  return Object.values(groupBy(filteredConfigData, 'category')).map(
    (categoryFilterConfigs) => {
      return {
        title: head(categoryFilterConfigs)?.category || '',
        filterConfigs: categoryFilterConfigs,
        filterConfigIds: categoryFilterConfigs.map(
          (filterConfig) => filterConfig.id
        ),
      };
    }
  );
};

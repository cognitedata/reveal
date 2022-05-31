import { useMemo } from 'react';
import { useQuery } from 'react-query';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import keyBy from 'lodash/keyBy';
import reduce from 'lodash/reduce';
import { fetchTenantFile } from 'utils/fetchTenantFile';

import { ProjectConfigMapLayers } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { LAYERS_QUERY_KEY } from 'constants/react-query';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useCategoryLayers } from 'modules/map/hooks/useCategoryLayers';
import { SelectableLayer, MapDataSource } from 'modules/map/types';
import { LegacyLayer, Layers } from 'tenants/types';

import { getLayersByKey, getLayerById } from '../utils';

const isSelectable = (value: unknown) => isString(value);

const getCombinedLayers = (
  projectConfigLayers = {},
  fetchedLegacyLayers = {}
) => {
  return reduce<Record<string, LegacyLayer>, Layers>(
    fetchedLegacyLayers,
    (combinedLayers, layer, id) => {
      if (
        combinedLayers[id] &&
        !(combinedLayers[id] as ProjectConfigMapLayers).disabled
      ) {
        return combinedLayers;
      }
      return { ...combinedLayers, [id]: layer };
    },
    {
      ...projectConfigLayers,
    }
  );
};

export const useLayers = () => {
  const [tenant] = getTenantInfo();
  const { data: mapConfig } = useProjectConfigByKey('map');

  const adaptedProjectConfigLayers = keyBy(mapConfig?.layers, 'id');

  const categoryLayers = useCategoryLayers();

  const defaultResponse = {
    layers: adaptedProjectConfigLayers,
    selectableLayers: [
      ...categoryLayers,
      ...getLayersByKey(adaptedProjectConfigLayers, 'alwaysOn'),
    ],
  };

  const { data, isFetched: layersReady } = useQuery(LAYERS_QUERY_KEY.ALL, () =>
    fetchTenantFile(tenant, 'layers')
      .then((fetchedLayers) => {
        const combinedLayers = getCombinedLayers(
          adaptedProjectConfigLayers,
          fetchedLayers
        );
        if (!isEmpty(combinedLayers)) {
          const alwaysOnLayers = getLayersByKey(combinedLayers, 'alwaysOn');
          return {
            layers: combinedLayers,
            selectableLayers: [...categoryLayers, ...alwaysOnLayers],
          };
        }
        return defaultResponse;
      })
      .catch((_) => defaultResponse)
  );

  const { layers, selectableLayers } = data || defaultResponse;

  return {
    layers,
    selectableLayers,
    layersReady,
  };
};

export interface TypeaheadResult {
  title: string;
  type: string;
  feature: any;
}

// might need to generalise this later on
// but for the license use case at the moment this will do
// wrapped in useMemo as useSearchableConfig was using it with useMemo callback
export const useSearchableLayers = (
  allLayers: Layers,
  allLayerData: MapDataSource[]
) => {
  return useMemo(() => {
    const searchableLayers = getLayersByKey(
      allLayers,
      'searchable',
      isSelectable
    );
    const results: TypeaheadResult[] = [];

    searchableLayers.forEach((searchableLayer: SelectableLayer) => {
      const hasData = getLayerById(allLayerData, searchableLayer.id);

      const hasFeatures = get(hasData, 'data.features');

      if (hasFeatures) {
        // cleanup the data for typehahead
        hasFeatures.forEach((feature: any) => {
          const field = allLayers[searchableLayer.id].searchable;

          const hasSearchable =
            field && feature.properties && feature.properties[field];
          if (hasSearchable) {
            results.push({
              title: hasSearchable,
              type: 'License',
              feature,
            });
          }
        });
      }
    });

    return results;
  }, [allLayers, allLayerData]);
};

export const useSearchableConfig = (
  allLayers: Layers,
  allLayerData: MapDataSource[]
) => {
  const { data: generalConfig } = useProjectConfigByKey('general');
  const title = generalConfig?.searchableLayerTitle;

  const layers = useSearchableLayers(allLayers, allLayerData);

  return useMemo(
    () => ({
      layers,
      title,
    }),
    [layers, title]
  );
};

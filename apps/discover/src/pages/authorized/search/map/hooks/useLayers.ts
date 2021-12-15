import { useMemo } from 'react';
import { useQuery } from 'react-query';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import keyBy from 'lodash/keyBy';

import { getTenantInfo } from '@cognite/react-container';

import { LAYERS_QUERY_KEY } from 'constants/react-query';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { fetchTenantFile } from 'hooks/useTenantConfig';
import { useCategoryLayers } from 'modules/map/hooks/useCategoryLayers';
import { SelectableLayer, MapDataSource } from 'modules/map/types';
import { WELL_HEADS_LAYER_ID } from 'pages/authorized/search/map/constants';
import { Layers } from 'tenants/types';

import { getLayersByKey, getLayerById } from '../utils';

export const useLayers = () => {
  const [tenant] = getTenantInfo();
  const { data: mapConfig } = useProjectConfigByKey('map');

  // TODO(PP-678) temp name, to be changed to id once done in backend.
  const adaptedProjectConfigLayers = keyBy(mapConfig?.layers, 'name');

  const categoryLayers = useCategoryLayers();

  const defaultResponse = {
    layers: adaptedProjectConfigLayers,
    selectableLayers: categoryLayers,
  };

  const { data, isFetched: layersReady } = useQuery(LAYERS_QUERY_KEY.ALL, () =>
    fetchTenantFile(tenant, 'layers')
      .then((fetchedLayers) => {
        const combinedLayers = {
          ...adaptedProjectConfigLayers,
          ...fetchedLayers,
        };
        if (!isEmpty(combinedLayers)) {
          const alwaysOnLayers = getLayersByKey(combinedLayers, 'alwaysOn');
          return {
            layers: combinedLayers,
            selectableLayers: [
              ...categoryLayers,
              ...alwaysOnLayers.filter(
                (layer) => layer.id !== WELL_HEADS_LAYER_ID
              ),
            ],
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
export const useSearchableLayers = (
  allLayers: Layers,
  allLayerData: MapDataSource[]
) => {
  const isSelectable = (value: unknown) => isString(value);
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
};

export const useSearchableConfig = (
  allLayers: Layers,
  allLayerData: MapDataSource[]
) => {
  const { data: generalConfig } = useProjectConfigByKey('general');
  const title = generalConfig?.searchableLayerTitle;
  const layers = useMemo(
    () => useSearchableLayers(allLayers, allLayerData),
    [allLayers, allLayerData]
  );

  return useMemo(
    () => ({
      layers,
      title,
    }),
    [layers, title]
  );
};

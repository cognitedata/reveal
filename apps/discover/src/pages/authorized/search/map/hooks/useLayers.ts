import { useMemo } from 'react';
import { useQuery } from 'react-query';

import get from 'lodash/get';
import isString from 'lodash/isString';

import { ProjectConfigGeneral } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { fetchTenantFile } from 'hooks/useTenantConfig';
import { useStaticSelectableLayers } from 'modules/map/hooks/useStaticSelectableLayers';
import { SelectableLayer, MapDataSource } from 'modules/map/types';
import { WELL_HEADS_LAYER_ID } from 'pages/authorized/search/map/constants';
import { Layers } from 'tenants/types';

import { getLayersByKey, getLayerById } from '../utils/layers';

const QUERY_KEY = 'LAYERS_QUERY';

export const useLayers = () => {
  const [tenant] = getTenantInfo();
  const staticSelectableLayers = useStaticSelectableLayers();

  const defaultResponse = {
    layers: {},
    selectableLayers: staticSelectableLayers,
  };

  const { data, isFetched: layersReady } = useQuery([QUERY_KEY], () =>
    fetchTenantFile(tenant, 'layers')
      .then((fetchedLayers) => {
        if (fetchedLayers) {
          const alwaysOnLayers = getLayersByKey(fetchedLayers, 'alwaysOn');
          return {
            layers: fetchedLayers,
            selectableLayers: [
              ...staticSelectableLayers,
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
  const title = useProjectConfigByKey<
    ProjectConfigGeneral['searchableLayerTitle']
  >('general.searchableLayerTitle')?.data;

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

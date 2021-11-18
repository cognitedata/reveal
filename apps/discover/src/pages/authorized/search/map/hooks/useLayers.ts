import { useEffect, useState } from 'react';

import get from 'lodash/get';
import isString from 'lodash/isString';

import { ProjectConfigGeneral } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { convertToCancellablePromise } from '_helpers/cancellablePromise';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { fetchTenantFile } from 'hooks/useTenantConfig';
import { useStaticSelectableLayers } from 'modules/map/hooks/useStaticSelectableLayers';
import { SelectableLayer, MapDataSource } from 'modules/map/types';
import { WELL_HEADS_LAYER_ID } from 'pages/authorized/search/map/constants';
import { Layers } from 'tenants/types';

import { getLayersByKey, getLayerById } from '../utils/layers';

export const useLayers = () => {
  const [tenant] = getTenantInfo();
  const [layers, setLayers] = useState<Layers>();
  const [selectableLayers, setSelectableLayers] = useState<SelectableLayer[]>(
    []
  );
  const [layersReady, setLayersReady] = useState(false);
  const staticSelectableLayers = useStaticSelectableLayers();

  useEffect(() => {
    setSelectableLayers(staticSelectableLayers);
    const cancellablePromise = convertToCancellablePromise(
      fetchTenantFile(tenant, 'layers')
    );

    cancellablePromise.promise
      .then((fetchedLayers) => {
        setLayers(fetchedLayers);
        if (fetchedLayers) {
          const selectableLayers = getLayersByKey(fetchedLayers, 'alwaysOn');
          setSelectableLayers([
            ...staticSelectableLayers,
            ...selectableLayers.filter(
              (layer) => layer.id !== WELL_HEADS_LAYER_ID
            ),
          ]);
        }
      })
      .catch(() => {
        // -- todo -- load base layers by default?
        setLayers({});
      })
      .finally(() => {
        setLayersReady(true);
      });

    return () => {
      cancellablePromise.cancel();
    };
  }, [tenant]);

  return {
    layers: layers || {},
    selectableLayers,
    layersReady,
  };
};

export interface TypeaheadResult {
  title: string;
  type: string;
  feature: any;
}

export const useSearchableConfig = (
  allLayers: Layers,
  allLayerData: MapDataSource[]
) => {
  const [layers] = useSearchableLayers(allLayers, allLayerData);
  return {
    layers,
    title: useProjectConfigByKey<ProjectConfigGeneral['searchableLayerTitle']>(
      'general.searchableLayerTitle'
    )?.data,
  };
};

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

  return [results];
};

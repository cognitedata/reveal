import * as React from 'react';

import get from 'lodash/get';

import {
  SelectableLayer,
  getLayersByKey,
  getLayerById,
} from '@cognite/react-map';

import { MapDataSource } from 'modules/map/types';

import { isSelectable } from './useLayers';

export interface TypeaheadResult {
  title: string;
  type: string;
  feature: any;
}

// might need to generalise this later on
// but for the license use case at the moment this will do
// wrapped in useMemo as useSearchableConfig was using it with useMemo callback

export const useSearchableLayers = (
  allLayers: SelectableLayer[],
  allLayerData: MapDataSource[]
) => {
  return React.useMemo(() => {
    const searchableLayers = getLayersByKey(
      // <- fix this lookup
      allLayers,
      'searchable',
      isSelectable
    );
    // console.log('searchableLayers', searchableLayers);
    const results: TypeaheadResult[] = [];

    searchableLayers.forEach((searchableLayer) => {
      const hasData = getLayerById(allLayerData, searchableLayer.id);

      const hasFeatures = get(hasData, 'data.features');

      if (hasFeatures) {
        // cleanup the data for typehahead
        hasFeatures.forEach((feature: any) => {
          const field = getLayerById(
            allLayerData,
            searchableLayer.id
          ).searchable;

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

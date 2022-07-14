import * as React from 'react';

import { SelectableLayer } from '@cognite/react-map';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { MapDataSource } from 'modules/map/types';

import { useSearchableLayers } from './useSearchableLayers';

export const useSearchableConfig = (
  allLayers: SelectableLayer[],
  allLayerData: MapDataSource[]
) => {
  const { data: generalConfig } = useProjectConfigByKey('general');
  const title = generalConfig?.searchableLayerTitle;

  const layers = useSearchableLayers(allLayers, allLayerData);

  return React.useMemo(
    () => ({
      layers,
      title,
    }),
    [layers, title]
  );
};

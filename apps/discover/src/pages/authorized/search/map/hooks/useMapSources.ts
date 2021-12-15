import React from 'react';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useDataFeatures } from 'modules/map/hooks/useDataFeatures';
import { useMap } from 'modules/map/selectors';
import { useSeismicMapFeatures } from 'modules/seismicSearch/hooks/useSeismicMapFeatures';
import { WELL_HEADS_LAYER_ID } from 'pages/authorized/search/map/constants';

import { useMapContent } from '../hooks';
import { createSources } from '../utils';

export const useMapSources = () => {
  const sources = useMapContent();
  const seismicCollection = useSeismicMapFeatures();
  const { selectedLayers } = useMap();
  const { data: mapConfig } = useProjectConfigByKey('map');

  const externalWells = sources?.find(
    (source) => source.id === WELL_HEADS_LAYER_ID
  );
  const features = useDataFeatures(
    selectedLayers,
    externalWells?.data.features || []
  );

  const resultSources = React.useMemo(
    () => createSources(seismicCollection, features, !!mapConfig?.cluster),
    [features, seismicCollection]
  );

  const combinedSources = React.useMemo(
    () =>
      sources
        ? [
            ...sources.filter((source) => source.id !== WELL_HEADS_LAYER_ID),
            ...resultSources,
          ]
        : [],
    [resultSources, sources]
  );

  return [combinedSources];
};

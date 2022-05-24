import { useDataFeatures } from 'modules/map/hooks/useDataFeatures';
import { useMapConfig } from 'modules/map/hooks/useMapConfig';
import { useMap } from 'modules/map/selectors';
import { useSeismicMapFeatures } from 'modules/seismicSearch/hooks/useSeismicMapFeatures';
import { WELL_HEADS_LAYER_ID } from 'pages/authorized/search/map/constants';

import { useDeepMemo } from '../../../../../hooks/useDeep';
import { useMapContent } from '../hooks';
import { createSources } from '../utils';

export const useMapSources = () => {
  const sources = useMapContent();
  const seismicCollection = useSeismicMapFeatures();
  const { selectedLayers } = useMap();
  const { data: mapConfig } = useMapConfig();

  const externalWells = useDeepMemo(() => {
    return sources?.find((source) => source.id === WELL_HEADS_LAYER_ID);
  }, [sources]);

  const features = useDataFeatures(
    selectedLayers,
    externalWells?.data.features || []
  );

  const resultSources = useDeepMemo(
    // this creates the sources and set's up the clustering layer
    () => createSources(seismicCollection, features, mapConfig?.cluster),
    [features, seismicCollection, mapConfig?.cluster, mapConfig?.zoom]
  );

  const combinedSources = useDeepMemo(
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

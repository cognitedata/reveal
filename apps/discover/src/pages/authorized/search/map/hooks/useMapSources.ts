import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useDataFeatures } from 'modules/map/hooks/useDataFeatures';
import { useDataFeatures as useDataFeaturesv2 } from 'modules/map/hooks/useDataFeaturesv2';
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
  const { data: generalConfig } = useProjectConfigByKey('general');

  const externalWells = useDeepMemo(() => {
    return sources?.find((source) => source.id === WELL_HEADS_LAYER_ID);
  }, [sources]);

  const features = useDataFeatures(
    selectedLayers,
    externalWells?.data.features || []
  );
  const featuresv2 = useDataFeaturesv2(
    selectedLayers,
    externalWells?.data.features || []
  );

  const resultSources = useDeepMemo(
    // this creates the sources and set's up the clustering layer
    () => createSources(seismicCollection, features),
    [features, seismicCollection]
  );

  const resultSourcesv2 = useDeepMemo(
    () => createSources(seismicCollection, featuresv2),
    [featuresv2, seismicCollection]
  );

  const combinedSources = useDeepMemo(
    () =>
      sources
        ? [
            ...sources.filter((source) => source.id !== WELL_HEADS_LAYER_ID),
            ...(generalConfig?.enableWellSDKV3
              ? resultSources
              : resultSourcesv2),
          ]
        : [],
    [resultSources, sources]
  );

  return [combinedSources];
};

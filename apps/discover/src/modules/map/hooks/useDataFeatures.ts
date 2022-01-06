import {
  feature as turfFeature,
  Feature,
  featureCollection,
  Geometry,
  GeometryCollection,
} from '@turf/helpers';
import includes from 'lodash/includes';
import reduce from 'lodash/reduce';

import { useDeepMemo } from 'hooks/useDeep';
import { useDocumentResultHits } from 'modules/documentSearch/hooks/useDocumentResultHits';
import { useSelectedDocumentIds } from 'modules/documentSearch/selectors';
import { getDocumentGeoPoint } from 'modules/documentSearch/utils/getGeoPoint';
import { useWellQueryResultWells } from 'modules/wellSearch/hooks/useWellQueryResultSelectors';
import { useWells } from 'modules/wellSearch/selectors';
import {
  DOCUMENT_LAYER_ID,
  DOCUMENT_MARKER,
  WELL_HEADS_LAYER_ID,
  WELL_MARKER,
} from 'pages/authorized/search/map/constants';

export type ExternalWellsFeature = Feature<
  Geometry | GeometryCollection,
  { id: number }
>;

export const useDataFeatures = (
  selectedLayers: string[],
  externalWells: ExternalWellsFeature[]
) => {
  const documentHits = useDocumentResultHits();
  const selectedDocumentIds = useSelectedDocumentIds();

  const wells = useWellQueryResultWells();
  const { selectedWellIds } = useWells();

  const selectedDocumentsWithGeo = useDeepMemo(() => {
    return documentHits.filter(
      (document) =>
        document.geolocation && selectedDocumentIds.includes(document.id)
    );
  }, [documentHits, selectedDocumentIds]);

  const selectedWellsWithGeo = useDeepMemo(() => {
    return wells.filter((well) => well.geometry && selectedWellIds[well.id]);
  }, [selectedWellIds, wells]);

  const documentSource: Feature[] = useDeepMemo(() => {
    const documentsWithGeo = documentHits.filter(
      (document) => document.geolocation
    );

    return documentsWithGeo.map((doc) => {
      const selectedInDocumentResults = includes(selectedDocumentIds, doc.id);
      const point = getDocumentGeoPoint(doc);

      return turfFeature(point, {
        documentId: doc.id,
        iconType: DOCUMENT_MARKER,
        isSelected: selectedInDocumentResults ? 'true' : 'false',
        isBlurred: selectedInDocumentResults
          ? false
          : selectedDocumentsWithGeo.length > 0 ||
            selectedWellsWithGeo.length > 0,
        customLayer: true,
      }) as Feature<any>;
    });
  }, [documentHits, selectedDocumentIds, selectedWellsWithGeo]);

  const wellSource: Feature[] = useDeepMemo(() => {
    return reduce(
      wells,
      (results, well) => {
        if (well?.geometry) {
          const isSelected = selectedWellIds[well.id];
          const wellFeature = turfFeature(well.geometry, {
            id: well.id,
            iconType: WELL_MARKER,
            isSelected: isSelected ? 'true' : 'false',
            isBlurred: isSelected
              ? false
              : selectedWellsWithGeo.length > 0 ||
                selectedDocumentsWithGeo.length > 0,
            customLayer: true,
          }) as Feature<Geometry>;

          results.push(wellFeature);
        }

        return results;
      },
      [] as Feature<Geometry>[]
    );
  }, [wells, selectedWellIds, selectedDocumentsWithGeo]);

  const documentSourceCollection = useDeepMemo(
    () => featureCollection(documentSource),
    [documentSource]
  );

  const wellCollection = useDeepMemo(
    () => featureCollection(wellSource),
    [wellSource]
  );

  const wellIds = useDeepMemo(() => wells.map((well) => well.id), [wells]);

  const externalWellsCollection = useDeepMemo(() => {
    return externalWells
      .map((well) => ({
        ...well,
        properties: {
          ...well.properties,
          iconType: WELL_MARKER,
          isSelected: 'false',
          isBlurred:
            selectedWellsWithGeo.length > 0 ||
            selectedDocumentsWithGeo.length > 0,
          customLayer: true,
        },
      }))
      .filter((well) => !wellIds.includes(well.properties.id));
  }, [externalWells, selectedWellsWithGeo, selectedDocumentsWithGeo, wellIds]);

  const features = useDeepMemo(
    () => ({
      ...documentSourceCollection,
      features: [
        ...(selectedLayers.includes(DOCUMENT_LAYER_ID)
          ? documentSourceCollection.features
          : []),
        ...(selectedLayers.includes(WELL_HEADS_LAYER_ID)
          ? wellCollection.features
          : []),
        ...(selectedLayers.includes(WELL_HEADS_LAYER_ID)
          ? externalWellsCollection
          : []),
      ],
    }),
    [
      documentSourceCollection,
      externalWellsCollection,
      wellCollection,
      selectedLayers,
    ]
  );

  return features;
};

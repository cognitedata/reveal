import { useMemo } from 'react';

import {
  feature as turfFeature,
  Feature,
  featureCollection,
  Geometry,
  GeometryCollection,
} from '@turf/helpers';
import includes from 'lodash/includes';
import reduce from 'lodash/reduce';

import {
  useDocumentResultHits,
  useSelectedDocumentIds,
} from 'modules/documentSearch/selectors';
import { getDocumentGeoPoint } from 'modules/documentSearch/utils/getGeoPoint';
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
  // const mapState = useMapState(); // map provider

  const wellResults = useWells();
  const documentHits = useDocumentResultHits();
  const selectedDocumentIds = useSelectedDocumentIds();

  const selectedDocumentsWithGeo = useMemo(() => {
    return documentHits.filter(
      (document) =>
        document.geolocation && selectedDocumentIds.includes(document.id)
    );
  }, [documentHits, selectedDocumentIds]);

  const selectedWellsWithGeo = useMemo(() => {
    return wellResults.wells.filter(
      (well) => well.geometry && wellResults.selectedWellIds[well.id]
    );
  }, [wellResults.selectedWellIds, wellResults.wells]);

  const documentSource: Feature[] = useMemo(() => {
    const documentsWithGeo = documentHits.filter(
      (document) => document.geolocation
    );

    return documentsWithGeo.map((doc) => {
      // const selectedInMap = mapState.selectedDocument?.id === doc.id;
      const selectedInDocumentResults = includes(selectedDocumentIds, doc.id);
      // const doesDocumentNeedHighlighted =
      //   selectedInMap || selectedInDocumentResults;
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
  }, [
    documentHits,
    // mapState.selectedDocument,
    selectedDocumentIds,
    selectedWellsWithGeo,
  ]);

  const wellSource: Feature[] = useMemo(() => {
    return reduce(
      wellResults.wells,
      (results, well) => {
        if (well?.geometry) {
          const isSelected = wellResults.selectedWellIds[well.id];
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
  }, [
    // externalWells,
    wellResults.wells,
    wellResults.selectedWellIds,
    selectedDocumentsWithGeo,
  ]);

  const documentSourceCollection = useMemo(
    () => featureCollection(documentSource),
    [documentSource]
  );

  const wellCollection = useMemo(
    () => featureCollection(wellSource),
    [wellSource]
  );

  const wellIds = useMemo(
    () => wellResults.wells.map((well) => well.id),
    [wellResults.wells]
  );

  const externalWellsCollection = useMemo(() => {
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

  const features = useMemo(
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

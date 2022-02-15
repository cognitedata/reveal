import {
  feature as turfFeature,
  Feature,
  featureCollection,
  Geometry,
  GeometryCollection,
} from '@turf/helpers';
import includes from 'lodash/includes';
import { useWellAllGeometryQuery } from 'services/well/useWellQuery';

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

import { useCreateAllWellCollectionV2 } from './useCreateAllWellCollectionv2';

export type ExternalWellsFeature = Feature<
  Geometry | GeometryCollection,
  { id: number | string }
>;

export const useWellQueryGeometryResultWells = () => {
  const { data: wells } = useWellAllGeometryQuery();

  return wells ? wells.features || [] : [];
};

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

  // console.log('All wells', wells);
  const wellCollection = useCreateAllWellCollectionV2({
    selectedWellIds,
    anotherReasonToBlur:
      selectedWellsWithGeo.length > 0 || selectedDocumentsWithGeo.length > 0,
  });

  const documentSourceCollection = useDeepMemo(
    () => featureCollection(documentSource),
    [documentSource]
  );

  const wellIds = useDeepMemo(() => wells.map((well) => well.id), [wells]);

  const externalWellsCollection = useDeepMemo(() => {
    const externalWellFeatures = externalWells.map((well) => ({
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
    }));

    return externalWellFeatures.filter(
      (well) => !wellIds.includes(`${well.id}` || `${well.properties.id}`)
    );
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

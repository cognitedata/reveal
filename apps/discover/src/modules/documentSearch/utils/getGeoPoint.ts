import { Point } from '@cognite/seismic-sdk-js';

import { DocumentType } from 'modules/documentSearch/types';
import { convertPolygonToPoint } from 'modules/map/helper';

export const getDocumentGeoPoint = (doc: DocumentType): Point | undefined => {
  if (doc.geolocation) {
    if (doc.geolocation.type === 'Point') {
      return doc.geolocation;
    }

    return convertPolygonToPoint(doc.geolocation);
  }

  return undefined;
};

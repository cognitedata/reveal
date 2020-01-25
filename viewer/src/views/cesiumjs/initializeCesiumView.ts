/*!
 * Copyright 2020 Cognite AS
 */
import * as Cesium from 'cesium';

import { SectorMetadata, SectorModelTransformation, Sector, SectorQuads } from '../../models/cad/types';
import { ConsumeSectorDelegate, DiscardSectorDelegate } from '../../models/cad/delegates';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { findSectorMetadata } from '../../models/cad/findSectorMetadata';
import { toCartesian3 } from './utilities';

export function initializeCesiumView(
  sectorRoot: SectorMetadata,
  modelTransformation: SectorModelTransformation,
  primitivesCollection: Cesium.PrimitiveCollection
): [DiscardSectorDelegate, ConsumeSectorDelegate<Sector>, ConsumeSectorDelegate<SectorQuads>] {
  // TODO 2019-11-05 larsmoa: Review how to handle code overlap between
  // this and initializeThreeJsView.
  // TODO 2019-11-05 larsmoa: Apply modelTransformation to Cesium root node

  const box = new Cesium.BoxGeometry({
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    minimum: toCartesian3(sectorRoot.bounds.min),
    maximum: toCartesian3(sectorRoot.bounds.max)
  } as any);
  const boundsGeometry = new Cesium.GeometryInstance({
    geometry: Cesium.BoxGeometry.createGeometry(box)
  });
  primitivesCollection.add(new Cesium.Primitive({ geometryInstances: boundsGeometry }));

  const consume: ConsumeSectorDelegate<Sector> = (sectorId, sector) => {
    const metadata = findSectorMetadata(sectorRoot, sectorId);
    consumeSectorDetailed(sectorId, sector, metadata, modelTransformation, primitivesCollection);
  };
  const noopDiscard: DiscardSectorDelegate = sectorId => {
    // TODO 2019-11-06 larsmoa:  Implement
  };
  const noopConsumeQuads: ConsumeSectorDelegate<SectorQuads> = (sectorId, sector) => {
    // TODO 2019-11-06 larsmoa: Implement
  };

  return [noopDiscard, consume, noopConsumeQuads];
}

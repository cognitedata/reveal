/*!
 * Copyright 2019 Cognite AS
 */

import { SectorMetadata, Sector, SectorModelTransformation } from '../../models/cad/types';
import * as Cesium from 'cesium';
import { toCesiumMatrix4 } from './utilities';

export function consumeSectorDetailed(
  sectorId: number,
  sector: Sector,
  metadata: SectorMetadata,
  modelTransformation: SectorModelTransformation,
  primitivesCollection: Cesium.PrimitiveCollection
) {
  if (sector.triangleMeshes.length === 0) {
    // No geometry
    return;
  }
  // TODO 20191025 larsmoa: Hack to avoid lots of big meshes, but
  // color information is lost. Fix.
  const geometryInstances: Cesium.GeometryInstance[] = [];
  const uniqueFiles = new Set<number>(sector.triangleMeshes.map(x => x.fileId));
  for (const fileId of uniqueFiles) {
    const mesh = sector.triangleMeshes.find(x => x.fileId === fileId)!;

    const attributes = new Cesium.GeometryAttributes();
    attributes.position = new Cesium.GeometryAttribute({
      componentDatatype: Cesium.ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: new Float64Array(mesh.vertices) as any // @types/cesium is missing support for typedarrays
    });
    attributes.color = new Cesium.GeometryAttribute({
      componentDatatype: Cesium.ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: mesh.colors as any // @types/cesium is missing support for typedarrays
    });

    const geometry = new Cesium.Geometry({
      attributes,
      indices: mesh.indices,
      boundingSphere: Cesium.BoundingSphere.fromVertices(mesh.vertices as any)
    });
    // Cesium.GeometryPipeline.
    const instance = new Cesium.GeometryInstance({
      geometry: Cesium.GeometryPipeline.computeNormal(geometry)
    });
    geometryInstances.push(instance);
  }
  const mergedMeshesPrimitive = new Cesium.Primitive({
    geometryInstances,
    // debugShowBoundingVolume: true,
    modelMatrix: toCesiumMatrix4(modelTransformation.modelMatrix),
    asynchronous: false,

    appearance: new Cesium.PerInstanceColorAppearance({
      flat: false,
      closed: false,
      translucent: false
    })
  });
  primitivesCollection.add(mergedMeshesPrimitive);
}

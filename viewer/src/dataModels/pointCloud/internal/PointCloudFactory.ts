/*!
 * Copyright 2020 Cognite AS
 */
// @ts-ignore
import * as Potree from '@cognite/potree-core';
import { PointCloudMetadata } from '@/dataModels/pointCloud/public/PointCloudMetadata';
import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { toThreeMatrix4 } from '@/utilities/utilities';

export class PointCloudFactory {
  constructor() {}

  createModel(modelMetadata: PointCloudMetadata): PotreeNodeWrapper {
    const { blobUrl, modelTransformation, scene } = modelMetadata;
    const geometry = new Potree.PointCloudEptGeometry(blobUrl, scene);
    const x = geometry.offset.x;
    const y = geometry.offset.y;
    const z = geometry.offset.z;
    const root = new Potree.PointCloudEptGeometryNode(geometry, geometry.boundingBox, 0, x, y, z);
    geometry.root = root;
    geometry.root.load();

    const octtree = new Potree.PointCloudOctree(geometry);
    octtree.name = 'PointCloudOctree'; // TODO: 25-05-2020 j-bjorne Should we just name it like this?
    octtree.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));
    const node = new PotreeNodeWrapper(octtree);
    return node;
  }
}

/*!
 * Copyright 2020 Cognite AS
 */

// @ts-ignore
import * as Potree from '@cognite/potree-core';

export class EptLoader {
  static async load(eptJsonUrl: string): Promise<Potree.PointCloudOctreeGeometry> {
    const response = await fetch(eptJsonUrl);
    const json = await response.json();
    const baseUrl = eptJsonUrl.substr(0, eptJsonUrl.lastIndexOf('ept.json'));
    const geometry = new Potree.PointCloudEptGeometry(baseUrl, json);
    const x = geometry.offset.x;
    const y = geometry.offset.y;
    const z = geometry.offset.z;
    const root = new Potree.PointCloudEptGeometryNode(geometry, geometry.boundingBox, 0, x, y, z);
    geometry.root = root;
    geometry.root.load();
    return geometry;
    // callback(geometry);
  }
}

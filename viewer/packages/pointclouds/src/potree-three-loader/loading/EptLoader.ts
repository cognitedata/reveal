import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';

import { fetchJson } from '../utils/fetchJson';

export class EptLoader {
  static async load(fullUrl: string): Promise<PointCloudEptGeometry> {
    return fetchJson(fullUrl).then((json: any) => {
      const url = fullUrl.substring(0, fullUrl.lastIndexOf('ept.json'));
      const geometry = new PointCloudEptGeometry(url, json);
      const root = new PointCloudEptGeometryNode(geometry);

      geometry.root = root;
      geometry.root.load();
      return geometry;
    });
  }
}

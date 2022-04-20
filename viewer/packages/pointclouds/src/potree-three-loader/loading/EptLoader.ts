/**
 * @author Connor Manning
 */

import { PointCloudEptGeometry } from '../PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from "../PointCloudEptGeometryNode";

export class EptLoader {
  static async load(fullUrl: string): Promise<PointCloudEptGeometry> {
    return new Promise<PointCloudEptGeometry>(async (res, _rej) => {
      const response = await fetch(fullUrl);
      const json = await response.json();

      const url = fullUrl.substr(0, fullUrl.lastIndexOf('ept.json'));
      const geometry = new PointCloudEptGeometry(url, json);
      const root = new PointCloudEptGeometryNode(geometry);

      geometry.root = root;
      geometry.root.load();

      res(geometry);
		// callback(geometry);
    });
  }
}

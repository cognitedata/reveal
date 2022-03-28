import { ModelDataProvider } from '@reveal/modeldata-api';
import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';

export class EptLoader {
  static async load(
    baseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider
  ): Promise<PointCloudEptGeometry> {
    return modelDataProvider.getJsonFile(baseUrl, fileName).then(async (json: any) => {
      const url = baseUrl + '/';
      const geometry = new PointCloudEptGeometry(url, json, modelDataProvider);
      const root = new PointCloudEptGeometryNode(geometry, modelDataProvider);

      geometry.root = root;
      await geometry.root.load();
      return geometry;
    });
  }
}

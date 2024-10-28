import { ModelDataProvider, StylableObject } from '@reveal/data-providers';
import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import { EptJson } from './EptJson';

export class EptLoader {
  static async load(
    baseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider,
    stylableObjects: StylableObject[]
  ): Promise<PointCloudEptGeometry> {
    const eptJsonPromise = modelDataProvider.getJsonFile(baseUrl, fileName);

    return eptJsonPromise.then(async (json: EptJson) => {
      const url = baseUrl + '/';
      const geometry = new PointCloudEptGeometry(url, json, modelDataProvider, stylableObjects);
      const root = new PointCloudEptGeometryNode(geometry, modelDataProvider);

      geometry.root = root;
      await geometry.root.load();
      return geometry;
    });
  }
}

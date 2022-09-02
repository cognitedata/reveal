import { ModelDataProvider } from '@reveal/modeldata-api';
import { PointCloudObjectAnnotationData } from '../../styling/PointCloudObjectAnnotationData';
import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import { EptJson } from './EptJson';

export class EptLoader {
  static async load(
    baseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider,
    objectProvider: PointCloudObjectAnnotationData
  ): Promise<PointCloudEptGeometry> {
    return modelDataProvider.getJsonFile(baseUrl, fileName).then(async (json: EptJson) => {
      const url = baseUrl + '/';
      const stylableObjects = objectProvider.annotations.map(a => a.stylableObject);
      const geometry = new PointCloudEptGeometry(url, json, modelDataProvider, stylableObjects);
      const root = new PointCloudEptGeometryNode(geometry, modelDataProvider);

      geometry.root = root;
      await geometry.root.load();
      return geometry;
    });
  }
}

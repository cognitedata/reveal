import type { DMModelIdentifier, ModelDataProvider, ModelIdentifier, StylableObject } from '@reveal/data-providers';
import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import type { EptJson } from './EptJson';
import type { PointCloudMetadataWithSignedFiles } from '../../types';

export class EptLoader {
  static async load(
    baseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider,
    modelIdentifier: ModelIdentifier,
    stylableObjects: StylableObject[]
  ): Promise<PointCloudEptGeometry> {
    const eptJsonPromise = modelDataProvider.getJsonFile<EptJson>(baseUrl, fileName);

    return eptJsonPromise.then(async (json: EptJson) => {
      const url = baseUrl + '/';
      const geometry = new PointCloudEptGeometry(url, json, modelDataProvider, stylableObjects);
      const root = new PointCloudEptGeometryNode(
        geometry,
        modelDataProvider,
        modelIdentifier,
        { fileData: json },
        undefined
      );

      geometry.root = root;
      await geometry.root.load();
      return geometry;
    });
  }

  static async dmsLoad(
    signedFilesBaseUrl: string,
    modelDataProvider: ModelDataProvider,
    stylableObjects: StylableObject[],
    modelIdentifier: DMModelIdentifier,
    preloadedData: PointCloudMetadataWithSignedFiles
  ): Promise<PointCloudEptGeometry> {
    const url = signedFilesBaseUrl + '/';

    const geometry = new PointCloudEptGeometry(url, preloadedData.fileData, modelDataProvider, stylableObjects);

    const root = new PointCloudEptGeometryNode(
      geometry,
      modelDataProvider,
      modelIdentifier,
      preloadedData,
      signedFilesBaseUrl
    );

    geometry.root = root;
    await geometry.root.load();
    return geometry;
  }
}

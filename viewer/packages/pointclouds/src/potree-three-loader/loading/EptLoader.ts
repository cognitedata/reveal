import { DMModelIdentifier, ModelDataProvider, ModelIdentifier, StylableObject } from '@reveal/data-providers';
import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import { EptJson } from './EptJson';
import { PointCloudMetadataWithSignedFiles } from '../../types';

export class EptLoader {
  static async load(
    baseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider,
    modelIdentifier: ModelIdentifier,
    stylableObjects: StylableObject[]
  ): Promise<PointCloudEptGeometry> {
    const eptJsonPromise = modelDataProvider.getJsonFile(baseUrl, fileName);

    return eptJsonPromise.then(async (json: { fileData: EptJson }) => {
      const url = baseUrl + '/';
      const geometry = new PointCloudEptGeometry(url, json.fileData, modelDataProvider, stylableObjects, undefined);
      const root = new PointCloudEptGeometryNode(geometry, modelDataProvider, modelIdentifier, undefined, undefined);

      geometry.root = root;
      await geometry.root.load();
      return geometry;
    });
  }

  static async dmsLoad(
    signedFilesBaseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider,
    stylableObjects: StylableObject[],
    modelIdentifier: DMModelIdentifier
  ): Promise<PointCloudEptGeometry> {
    const eptJsonPromise = modelDataProvider.getDMSJsonFile(
      signedFilesBaseUrl,
      modelIdentifier,
      fileName
    ) as Promise<PointCloudMetadataWithSignedFiles>;

    return eptJsonPromise.then(async (json: PointCloudMetadataWithSignedFiles) => {
      const url = signedFilesBaseUrl + '/';

      const signedFiles = json.signedFiles.items;
      let signedUrl: string | undefined;
      if (signedFiles.length > 0) {
        signedUrl = signedFiles.find(file => file.fileName === fileName)?.signedUrl;
      }
      const geometry = new PointCloudEptGeometry(url, json.fileData, modelDataProvider, stylableObjects, signedUrl);

      const root = new PointCloudEptGeometryNode(
        geometry,
        modelDataProvider,
        modelIdentifier,
        signedFilesBaseUrl,
        signedUrl
      );

      geometry.root = root;
      await geometry.root.load();
      return geometry;
    });
  }
}

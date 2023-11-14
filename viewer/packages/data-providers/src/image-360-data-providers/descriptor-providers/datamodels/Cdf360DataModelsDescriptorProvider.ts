/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, ExternalId, FileInfo } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360Descriptor,
  Image360DescriptorProvider,
  Image360FileDescriptor
} from '../../../types';
import { Cdf360FdmQuery, get360CollectionQuery } from './get360CollectionQuery';
import assert from 'assert';
import { Euler, Matrix4 } from 'three';
import { DataModelsSdk } from '../../../DataModelsSdk';
import chunk from 'lodash/chunk';

export type DM360CollectionIdentifier = {
  space: string;
  image360CollectionExternalId: string;
};

type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<Cdf360FdmQuery>>>;
type Image360Result = QueryResult['images'];
type Image360InstanceResult = QueryResult['images'][number];
type Image360ResultProperties = Image360InstanceResult['properties']['cdf_360_image_schema']['Image360/v1'];

export class Cdf360DataModelsDescriptorProvider implements Image360DescriptorProvider<DM360CollectionIdentifier> {
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _cogniteSdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._cogniteSdk = sdk;
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  public async get360ImageDescriptors(
    { image360CollectionExternalId, space }: DM360CollectionIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet[]> {
    const query = get360CollectionQuery(image360CollectionExternalId, space);
    const { image_collection, images } = await this._dmsSdk.queryNodesAndEdges(query);

    if (image_collection.length === 0) {
      return [];
    }

    assert(image_collection.length === 1, 'Expected exactly one image collection');

    const collection = image_collection[0];
    const collectionId = collection.externalId;
    const collectionLabel = collection.properties.cdf_360_image_schema['Image360Collection/v1'].label as string;
    const fileDescriptors = await this.getFileDescriptors(images);
    return images.map((image, n) =>
      this.getHistorical360ImageSet(collectionId, collectionLabel, image, fileDescriptors[n])
    );
  }

  private async getFileDescriptors(images: Image360Result) {
    const imageProps = images.map(image => image.properties.cdf_360_image_schema['Image360/v1']);
    const cubeMapExternalIds = imageProps.flatMap(imageProp => [
      { externalId: imageProp.cubeMapFront } as ExternalId,
      { externalId: imageProp.cubeMapBack } as ExternalId,
      { externalId: imageProp.cubeMapLeft } as ExternalId,
      { externalId: imageProp.cubeMapRight } as ExternalId,
      { externalId: imageProp.cubeMapTop } as ExternalId,
      { externalId: imageProp.cubeMapBottom } as ExternalId
    ]);
    const externalIdBatches = chunk(cubeMapExternalIds, 1000);
    const fileInfos = (
      await Promise.all(externalIdBatches.map(batch => this._cogniteSdk.files.retrieve(batch)))
    ).flatMap(p => p);
    return chunk(fileInfos, 6);
  }

  private getHistorical360ImageSet(
    collectionId: string,
    collectionLabel: string,
    image: Image360InstanceResult,
    fileInfos: FileInfo[]
  ): Historical360ImageSet {
    const imageProps = image.properties.cdf_360_image_schema['Image360/v1'];

    return {
      collectionId,
      collectionLabel,
      id: image.externalId,
      imageRevisions: [this.getImageRevision(imageProps, fileInfos)],
      label: imageProps.label as string,
      transform: this.getRevisionTransform(imageProps as any)
    };
  }

  private getImageRevision(imageProps: Image360ResultProperties, fileInfos: FileInfo[]): Image360Descriptor {
    return {
      faceDescriptors: getFaceDescriptors(),
      timestamp: imageProps.timeTaken as number
    };

    function getFaceDescriptors(): Image360FileDescriptor[] {
      return [
        {
          fileId: fileInfos[0].id,
          face: 'front',
          mimeType: fileInfos[0].mimeType!
        },
        {
          fileId: fileInfos[0].id,
          face: 'back',
          mimeType: fileInfos[0].mimeType!
        },
        {
          fileId: fileInfos[0].id,
          face: 'left',
          mimeType: fileInfos[0].mimeType!
        },
        {
          fileId: fileInfos[0].id,
          face: 'right',
          mimeType: fileInfos[0].mimeType!
        },
        {
          fileId: fileInfos[0].id,
          face: 'top',
          mimeType: fileInfos[0].mimeType!
        },
        {
          fileId: fileInfos[0].id,
          face: 'bottom',
          mimeType: fileInfos[0].mimeType!
        }
      ] as Image360FileDescriptor[];
    }
  }

  private getRevisionTransform(revision: {
    translationX: number;
    translationY: number;
    translationZ: number;
    eulerRotationX: number;
    eulerRotationY: number;
    eulerRotationZ: number;
  }): Matrix4 {
    const transform = getTranslation();
    transform.multiply(getEulerRotation());
    return transform;

    function getEulerRotation(): Matrix4 {
      const [x, y, z] = [revision.eulerRotationX, revision.eulerRotationY, revision.eulerRotationZ];
      const eulerRotation = new Euler(x, z, -y, 'XYZ');
      return new Matrix4().makeRotationFromEuler(eulerRotation);
    }

    function getTranslation(): Matrix4 {
      const [x, y, z] = [revision.translationX, revision.translationY, revision.translationZ];
      return new Matrix4().makeTranslation(x, z, -y);
    }
  }
}

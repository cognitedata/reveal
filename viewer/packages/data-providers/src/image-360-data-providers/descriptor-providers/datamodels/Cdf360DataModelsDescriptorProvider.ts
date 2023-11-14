/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, ExternalId, FileInfo } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360Descriptor,
  Image360DescriptorProvider,
  Image360FileDescriptor,
  QueryNextCursors
} from '../../../types';
import { Cdf360FdmQuery, get360CollectionQuery } from './get360CollectionQuery';
import assert from 'assert';
import { Euler, Matrix4 } from 'three';
import { DataModelsSdk } from '../../../DataModelsSdk';
import chunk from 'lodash/chunk';

export type UniqueIdentifier = {
  space: string;
  image360CollectionExternalId: string;
};

type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<Cdf360FdmQuery>>>;

type ImageResult = QueryResult['images'];
type ImageInstanceResult = QueryResult['images'][number];
type ImageResultProperties = ImageInstanceResult['properties']['cdf_360_image_schema']['Image360/v1'];

type ExhaustedQueryResult = {
  image_collection: QueryResult['image_collection'];
  images: QueryResult['images'];
  stations: QueryResult['stations'];
};

export class Cdf360DataModelsDescriptorProvider implements Image360DescriptorProvider<UniqueIdentifier> {
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _cogniteSdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._cogniteSdk = sdk;
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  public async get360ImageDescriptors(
    collectionIdentifier: UniqueIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet[]> {
    const { image_collection, images } = await this.queryCollection(collectionIdentifier);

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

  private async queryCollection({
    image360CollectionExternalId,
    space
  }: UniqueIdentifier): Promise<ExhaustedQueryResult> {
    const result: ExhaustedQueryResult = {
      image_collection: [],
      images: [],
      stations: []
    };

    const query = get360CollectionQuery(image360CollectionExternalId, space);

    const imageLimit = query.with.images.limit;

    let nextCursor: QueryNextCursors<Cdf360FdmQuery> | undefined = undefined;
    let hasNext = true;

    while (hasNext) {
      const {
        image_collection,
        images,
        stations,
        nextCursor: currentCursor
      }: QueryResult = await this._dmsSdk.queryNodesAndEdges(query, nextCursor);
      if (result.image_collection.length === 0) {
        result.image_collection.push(...image_collection);
      }
      result.images.push(...images);
      result.stations.push(...stations);

      hasNext = images.length === imageLimit;
      nextCursor = {
        images: currentCursor?.images,
        stations: currentCursor?.stations
      };
    }

    return result;
  }

  private async getFileDescriptors(images: ImageResult) {
    const imageProps = images.map(image => image.properties.cdf_360_image_schema['Image360/v1']);
    const cubeMapExternalIds = imageProps.flatMap(imageProp => [
      { externalId: imageProp.cubeMapFront } as ExternalId,
      { externalId: imageProp.cubeMapBack } as ExternalId,
      { externalId: imageProp.cubeMapLeft } as ExternalId,
      { externalId: imageProp.cubeMapRight } as ExternalId,
      { externalId: imageProp.cubeMapTop } as ExternalId,
      { externalId: imageProp.cubeMapBottom } as ExternalId
    ]);
    const externalIdBatches = chunk(chunk(cubeMapExternalIds, 1000), 15);

    const fileInfos: FileInfo[] = [];
    for (const parallelBatches of externalIdBatches) {
      const batchFileInfos = (
        await Promise.all(parallelBatches.map(batch => this._cogniteSdk.files.retrieve(batch)))
      ).flatMap(p => p);
      fileInfos.push(...batchFileInfos);
    }

    return chunk(fileInfos, 6);
  }

  private getHistorical360ImageSet(
    collectionId: string,
    collectionLabel: string,
    image: ImageInstanceResult,
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

  private getImageRevision(imageProps: ImageResultProperties, fileInfos: FileInfo[]): Image360Descriptor {
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
          fileId: fileInfos[1].id,
          face: 'back',
          mimeType: fileInfos[1].mimeType!
        },
        {
          fileId: fileInfos[2].id,
          face: 'left',
          mimeType: fileInfos[2].mimeType!
        },
        {
          fileId: fileInfos[3].id,
          face: 'right',
          mimeType: fileInfos[3].mimeType!
        },
        {
          fileId: fileInfos[4].id,
          face: 'top',
          mimeType: fileInfos[5].mimeType!
        },
        {
          fileId: fileInfos[5].id,
          face: 'bottom',
          mimeType: fileInfos[5].mimeType!
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

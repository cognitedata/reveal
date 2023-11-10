/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360Descriptor,
  Image360DescriptorProvider,
  Image360FileDescriptor
} from '../types';
import { DmsSDK } from './DmsSdk';
import { Cdf360FdmQuery, get360CollectionQuery } from './Cdf360FdmQuery';
import assert from 'assert';
import { Euler, Matrix4 } from 'three';

export type DM360CollectionIdentifier = {
  space: string;
  image360CollectionExternalId: string;
};

type QueryResult = Awaited<ReturnType<typeof DmsSDK.prototype.queryNodesAndEdges<Cdf360FdmQuery>>>;
type Image360Result = QueryResult['images'][number];
type Image360ResultProperties = Image360Result['properties']['cdf_360_image_schema']['Image360/v1'];

export class Cdf360FdmProvider implements Image360DescriptorProvider<DM360CollectionIdentifier> {
  private readonly _dmsSDK: DmsSDK;

  constructor(sdk: CogniteClient) {
    this._dmsSDK = new DmsSDK(sdk);
  }

  public async get360ImageDescriptors(
    { image360CollectionExternalId, space }: DM360CollectionIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet[]> {
    // let hasNextPage = true;
    // let nextCursors: Record<string, string> = {};

    const sets: Historical360ImageSet[] = [];

    const query = get360CollectionQuery(image360CollectionExternalId, space);
    const { image_collection, images } = await this._dmsSDK.queryNodesAndEdges(query);

    if (image_collection.length === 0) {
      return [];
    }

    assert(image_collection.length === 1, 'Expected exactly one image collection');

    const collection = image_collection[0];
    const collectionId = collection.externalId;
    const collectionLabel = collection.properties.cdf_360_image_schema['Image360Collection/v1'].label as string;
    return images.map(image => this.getHistorical360ImageSet(collectionId, collectionLabel, image));

    // while (hasNextPage) {
    //   // const result = await this._dmsSDK.queryNodesAndEdges(query);

    //   const { collection_360, images } = result.items;
    //   const collectionId = collection_360[0].space;
    //   const collectionProps = collection_360[0].properties;
    //   const collectionLabel = collectionProps.label;
    //   const hSets = images.map(image => this.getHistorical360ImageSet(collectionId, collectionLabel, image));
    //   sets.push(...hSets);

    //   hasNextPage = result.nextCursor !== undefined && result.nextCursor.images !== undefined && images.length >= 10000;
    //   if (hasNextPage) {
    //     nextCursors = {
    //       images: result.nextCursor?.images as string
    //     };
    //   }
    // }

    return sets;
  }

  private getHistorical360ImageSet(
    collectionId: string,
    collectionLabel: string,
    image: Image360Result
  ): Historical360ImageSet {
    const imageProps = image.properties.cdf_360_image_schema['Image360/v1'];

    return {
      collectionId,
      collectionLabel,
      id: image.externalId,
      imageRevisions: [this.getImageRevision(imageProps)],
      label: imageProps.label as string,
      transform: this.getRevisionTransform(imageProps as any)
    };
  }

  private getImageRevision(imageProps: Image360ResultProperties): Image360Descriptor {
    return {
      faceDescriptors: getFaceDescriptors(),
      timestamp: imageProps.timeTaken as number
    };

    function getFaceDescriptors(): Image360FileDescriptor[] {
      return [
        {
          fileId: { externalId: imageProps.cubeMapFront as string },
          face: 'front',
          mimeType: 'image/jpeg'
        },
        {
          fileId: { externalId: imageProps.cubeMapBack as string },
          face: 'back',
          mimeType: 'image/jpeg'
        },
        {
          fileId: { externalId: imageProps.cubeMapLeft as string },
          face: 'left',
          mimeType: 'image/jpeg'
        },
        {
          fileId: { externalId: imageProps.cubeMapRight as string },
          face: 'right',
          mimeType: 'image/jpeg'
        },
        {
          fileId: { externalId: imageProps.cubeMapTop as string },
          face: 'top',
          mimeType: 'image/jpeg'
        },
        {
          fileId: { externalId: imageProps.cubeMapBottom as string },
          face: 'bottom',
          mimeType: 'image/jpeg'
        }
      ];
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

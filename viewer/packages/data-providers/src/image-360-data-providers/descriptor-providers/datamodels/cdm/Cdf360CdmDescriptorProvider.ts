/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, DirectRelationReference, FileInfo } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360Descriptor,
  Image360DescriptorProvider,
  Image360FileDescriptor,
  InstanceIdentifier,
  QueryNextCursors
} from '../../../../types';
import { Cdf360FdmQuery, get360CollectionQuery } from './get360CdmCollectionQuery';
import assert from 'assert';
import { Euler, Matrix4 } from 'three';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import chunk from 'lodash/chunk';
import zip from 'lodash/zip';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { Image360DataModelIdentifier } from '../system-space/Cdf360DataModelsDescriptorProvider';

type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<Cdf360FdmQuery>>>;

type ImageResult = QueryResult['images'];
type ImageInstanceResult = QueryResult['images'][number];
type ImageResultProperties = ImageInstanceResult['properties']['cdf_cdm']['Cognite360Image/v1'];

type ExhaustedQueryResult = {
  image_collection: QueryResult['image_collection'];
  images: QueryResult['images'];
  stations: QueryResult['stations'];
};

export class Cdf360CdmDescriptorProvider implements Image360DescriptorProvider<Image360DataModelIdentifier> {
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _cogniteSdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._cogniteSdk = sdk;
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  public async get360ImageDescriptors(
    collectionIdentifier: Image360DataModelIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet[]> {
    const { image_collection, images } = await this.queryCollection(collectionIdentifier);

    if (image_collection.length === 0) {
      return [];
    }

    assert(image_collection.length === 1, 'Expected exactly one image collection');

    const collection = image_collection[0];
    const collectionId = collection.externalId;
    const collectionLabel = collection.properties.cdf_cdm['Cognite360ImageCollection/v1'].name as string;
    const fileDescriptors = await this.getFileDescriptors(images);

    assert(images.length === fileDescriptors.length, 'Expected each 360 image to have 6 faces');

    const imagesGroupedWithFileDescriptors = zip(images, fileDescriptors)
      .filter(
        (imageWithFileInfo): imageWithFileInfo is [ImageInstanceResult, FileInfo[]] =>
          imageWithFileInfo[0] !== undefined && imageWithFileInfo[1] !== undefined
      )
      .map(([image, fileDescriptors]) => ({ image, fileDescriptors }));

    const [imagesWithoutStation, imagesWithStation] = partition(imagesGroupedWithFileDescriptors, image => {
      return image.image.properties.cdf_cdm['Cognite360Image/v1'].station360 === undefined;
    });

    const groups = groupBy(imagesWithStation, imageResult => {
      const station = imageResult.image.properties.cdf_cdm['Cognite360Image/v1'].station360 as InstanceIdentifier;
      return `${station.externalId}-${station.space}`;
    });

    const ret = Object.values(groups)
      .concat(imagesWithoutStation.map(p => [p]))
      .map(imageWithFileDescriptors => {
        return this.getHistorical360ImageSet(collectionId, collectionLabel, imageWithFileDescriptors);
      });

    return ret;
  }

  private async queryCollection({
    image360CollectionExternalId,
    space
  }: Image360DataModelIdentifier): Promise<ExhaustedQueryResult> {
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

      hasNext =
        images.length === imageLimit && currentCursor?.images !== undefined && currentCursor?.stations !== undefined;
      nextCursor = {
        images: currentCursor?.images,
        stations: currentCursor?.stations
      };
    }

    return result;
  }

  private async getFileDescriptors(images: ImageResult) {
    const imageProps = images.map(image => image.properties.cdf_cdm['Cognite360Image/v1']);
    const cubeMapFileIds = imageProps.flatMap(imageProp => [
      imageProp.front as DirectRelationReference,
      imageProp.back as DirectRelationReference,
      imageProp.left as DirectRelationReference,
      imageProp.right as DirectRelationReference,
      imageProp.top as DirectRelationReference,
      imageProp.bottom as DirectRelationReference
    ]);

    const externalIdBatches = chunk(chunk(cubeMapFileIds, 1000), 15);

    const fileInfos: FileInfo[] = [];
    for (const parallelBatches of externalIdBatches) {
      const batchFileInfos = (
        await Promise.all(parallelBatches.map(batch => getCdmFiles(this._cogniteSdk, batch)))
      ).flatMap(p => p);
      fileInfos.push(...batchFileInfos);
    }

    return chunk(fileInfos, 6);
  }

  private getHistorical360ImageSet(
    collectionId: string,
    collectionLabel: string,
    imageFileDescriptors: { image: ImageInstanceResult; fileDescriptors: FileInfo[] }[]
  ): Historical360ImageSet {
    const mainImageProps = imageFileDescriptors[0].image.properties.cdf_cdm['Cognite360Image/v1'];
    const id = imageFileDescriptors[0].image.externalId;
    return {
      collectionId,
      collectionLabel,
      id,
      imageRevisions: imageFileDescriptors.map(p => this.getImageRevision(mainImageProps, p.fileDescriptors)),
      label: '',
      transform: this.getRevisionTransform(mainImageProps as any)
    };
  }

  private getImageRevision(imageProps: ImageResultProperties, fileInfos: FileInfo[]): Image360Descriptor {
    return {
      faceDescriptors: getFaceDescriptors(),
      timestamp: imageProps.takenAt as string
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

type CoreDmFileResponse = {
  data: {
    items: FileInfo[];
  };
};

async function getCdmFiles(sdk: CogniteClient, identifiers: DirectRelationReference[]) {
  const url = `${sdk.getBaseUrl()}/api/v1/projects/${sdk.project}/files/byids`;
  const res = (await sdk.post(url, {
    data: { items: identifiers.map(id => ({ instanceId: id })) }
  })) as CoreDmFileResponse;

  return res.data.items;
}

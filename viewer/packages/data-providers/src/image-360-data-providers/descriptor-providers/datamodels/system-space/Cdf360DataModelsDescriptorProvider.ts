/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360Descriptor,
  Image360DescriptorProvider,
  Image360FileDescriptor,
  QueryNextCursors
} from '../../../../types';
import { Cdf360FdmQuery, get360CollectionQuery } from './get360CollectionQuery';
import assert from 'assert';
import { Euler, Matrix4 } from 'three';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { DMInstanceRef, dmInstanceRefToKey } from '@reveal/utilities';
import { DMInstanceKey } from '@reveal/utilities/src/fdm/toKey';
import { ClassicDataSourceType } from '../../../../DataSourceType';
import { DEFAULT_360_IMAGE_MIME_TYPE } from '../../../../utilities/constants';

/**
 * An identifier uniquely determining a datamodel-based instance of a Cognite 360 image collection
 */
export type Image360DataModelIdentifier = Image360BaseIdentifier & {
  /**
   * Source Type for the model - 'dm' for legacy FDM 360 images, 'cdm' for CoreDM-based ones
   */
  source?: 'dm' | 'cdm';
};

/**
 * An Identifier uniquely determining a legacy datamodel-based instance of a Cognite 360 image collection
 */
export type Image360LegacyDataModelIdentifier = {
  source: 'dm';
} & Image360BaseIdentifier;
/**
 * An Identifier uniquely determining a CoreDM-based instance of a Cognite 360 image collection
 */
export type Image360CoreDataModelIdentifier = {
  source: 'cdm';
} & Image360BaseIdentifier;

/**
 * Common properties for the Image360 Datamodel identifiers
 */
export type Image360BaseIdentifier = {
  space: string;
  image360CollectionExternalId: string;
};

type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<Cdf360FdmQuery>>>;

type ImageInstanceResult = QueryResult['images'][number];
type ImageResultProperties = ImageInstanceResult['properties']['cdf_360_image_schema']['Image360/v1'];

type ExhaustedQueryResult = {
  image_collection: QueryResult['image_collection'];
  images: QueryResult['images'];
  stations: QueryResult['stations'];
};

export class Cdf360DataModelsDescriptorProvider implements Image360DescriptorProvider<ClassicDataSourceType> {
  readonly _dmsSdk: DataModelsSdk;

  constructor(sdk: CogniteClient) {
    this._dmsSdk = new DataModelsSdk(sdk);
  }

  public async get360ImageDescriptors(
    collectionIdentifier: Image360DataModelIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet<ClassicDataSourceType>[]> {
    const { image_collection, images } = await this.queryCollection(collectionIdentifier);

    if (image_collection.length === 0) {
      return [];
    }

    assert(image_collection.length === 1, 'Expected exactly one image collection');

    const collection = image_collection[0];
    const collectionId = collection.externalId;
    const collectionLabel = collection.properties.cdf_360_image_schema['Image360Collection/v1'].label as string;

    // Create file descriptors directly from DMS query results using external IDs
    const imagesWithFileDescriptors = images.map(image => ({
      image,
      fileDescriptors: this.createFileDescriptorsFromImage(image)
    }));

    const [imagesWithoutStation, imagesWithStation] = partition(imagesWithFileDescriptors, image => {
      return image.image.properties.cdf_360_image_schema['Image360/v1'].station === undefined;
    });

    const groups = groupBy(imagesWithStation, imageResult => {
      const station = imageResult.image.properties.cdf_360_image_schema['Image360/v1'].station as DMInstanceRef;
      return dmInstanceRefToKey(station);
    });

    return Object.values(groups)
      .concat(imagesWithoutStation.map(p => [p]))
      .map(imageWithFileDescriptors => {
        return this.getHistorical360ImageSet(collectionId, collectionLabel, imageWithFileDescriptors);
      });
  }

  /**
   * Creates file descriptors directly from the DMS image data using external IDs.
   */
  private createFileDescriptorsFromImage(image: ImageInstanceResult): Image360FileDescriptor[] {
    const imageProps = image.properties.cdf_360_image_schema['Image360/v1'];
    return [
      { externalId: imageProps.cubeMapFront as string, face: 'front', mimeType: DEFAULT_360_IMAGE_MIME_TYPE },
      { externalId: imageProps.cubeMapBack as string, face: 'back', mimeType: DEFAULT_360_IMAGE_MIME_TYPE },
      { externalId: imageProps.cubeMapLeft as string, face: 'left', mimeType: DEFAULT_360_IMAGE_MIME_TYPE },
      { externalId: imageProps.cubeMapRight as string, face: 'right', mimeType: DEFAULT_360_IMAGE_MIME_TYPE },
      { externalId: imageProps.cubeMapTop as string, face: 'top', mimeType: DEFAULT_360_IMAGE_MIME_TYPE },
      { externalId: imageProps.cubeMapBottom as string, face: 'bottom', mimeType: DEFAULT_360_IMAGE_MIME_TYPE }
    ];
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

  private getHistorical360ImageSet(
    collectionId: string,
    collectionLabel: string,
    imageFileDescriptors: { image: ImageInstanceResult; fileDescriptors: Image360FileDescriptor[] }[]
  ): Historical360ImageSet<ClassicDataSourceType> {
    const mainImagePropsArray = imageFileDescriptors.map(
      descriptor => descriptor.image.properties.cdf_360_image_schema['Image360/v1']
    );

    const id = imageFileDescriptors[0].image.externalId;

    return {
      collectionId,
      collectionLabel,
      id,
      imageRevisions: imageFileDescriptors.map((p, index) =>
        this.getImageRevision(dmInstanceRefToKey(p.image), mainImagePropsArray[index], p.fileDescriptors)
      ),
      label: mainImagePropsArray[0].label as string,
      transform: this.getRevisionTransform(mainImagePropsArray[0] as any)
    };
  }

  private getImageRevision(
    revisionId: DMInstanceKey,
    imageProps: ImageResultProperties,
    fileDescriptors: Image360FileDescriptor[]
  ): Image360Descriptor<ClassicDataSourceType> {
    return {
      id: revisionId,
      faceDescriptors: fileDescriptors,
      timestamp: imageProps.timeTaken as string
    };
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

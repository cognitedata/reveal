/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360FileDescriptor,
  Image360EventDescriptor,
  Image360DescriptorProvider,
  Image360Descriptor
} from '../types';
import { Euler, Matrix4 } from 'three';
import assert from 'assert';
import { DmsSDK, DmsUniqueIdentifier, EdgeItem, Item, Source } from './DmsSdk';

export type DM360CollectionIdentifier = {
  space: string;
  dataModelExternalId: string;
  image360CollectionExternalId: string;
};

type JSONData = {
  getImage360CollectionById: {
    items: Image360Collection[];
  };
};

type Image360Collection = {
  externalId: string;
  label: string;
  stations: {
    items: Image360Station[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
};

type Image360Station = {
  externalId: string;
  label: string;
  revisions: {
    items: Image360Revision[];
  };
};

type Image360Revision = {
  externalId: string;
  label: string;
  timeTaken: number | null;
  translation: {
    x: number;
    y: number;
    z: number;
  };
  eulerRotation: {
    x: number;
    y: number;
    z: number;
  };
  cubeMap: {
    back: FileMetadata;
    bottom: FileMetadata;
    front: FileMetadata;
    left: FileMetadata;
    right: FileMetadata;
    top: FileMetadata;
  };
};

type FileMetadata = {
  id: number;
  mimeType: 'image/jpeg' | 'image/png';
};

type Image360RevisionResult = {
  label: string;
  cubeMap: DmsUniqueIdentifier;
  eulerRotation: DmsUniqueIdentifier;
  translation: DmsUniqueIdentifier;
};

type CubeMap = {
  back: string;
  bottom: string;
  front: string;
  left: string;
  right: string;
  top: string;
};

type Vec3d = {
  x: number;
  y: number;
  z: number;
};

export class Cdf360FdmProvider implements Image360DescriptorProvider<DM360CollectionIdentifier> {
  private readonly _sdk: CogniteClient;
  private readonly _dmsSDK: DmsSDK;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
    this._dmsSDK = new DmsSDK(sdk);
  }
  public async get360ImageDescriptors(
    metadataFilter: DM360CollectionIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet[]> {
    const start = performance.now();
    await this.fetchImageCollection(metadataFilter);
    console.log(`Fetch took ${performance.now() - start} ms.`);

    throw new Error('Method not implemented.');

    return [];
  }

  private async fetchImageCollection(metadataFilter: DM360CollectionIdentifier): Promise<Image360Station[]> {
    const { space, image360CollectionExternalId } = metadataFilter;

    const image360CollectionSource: Source = { externalId: 'Image360Collection', space, type: 'view', version: '1' };
    const image360CollectionItem: Item = { externalId: image360CollectionExternalId, instanceType: 'node', space };

    const image360CollectionResult = this._dmsSDK.getInstancesByExternalIds(
      [image360CollectionItem],
      image360CollectionSource
    );
    const image360StationsResult = this.fetchImageStations(image360CollectionExternalId, space);

    const [image360Collection, image360Stations] = await Promise.all([
      image360CollectionResult,
      image360StationsResult
    ]);

    return [];
  }

  private async fetchImageStations(collectionExternalId: string, space: string): Promise<any> {
    const stationSource: Source = { externalId: 'Image360Station', space, type: 'view', version: '1' };
    const filter = {
      equals: {
        property: ['edge', 'startNode'],
        value: { externalId: collectionExternalId, space }
      }
    };
    const collectionToStationEdgeItems = await this._dmsSDK.filterInstances(filter, 'edge');
    const image360RevisionResult = this.fetchImageRevisions(collectionToStationEdgeItems, space);
    const fetchStationItems: Item[] = collectionToStationEdgeItems.map(edgeItem => {
      return {
        instanceType: 'node',
        ...edgeItem.endNode
      };
    });
    const stationItemsResult = this._dmsSDK.getInstancesByExternalIds<{ label: string }>(
      fetchStationItems,
      stationSource
    );

    await Promise.all([image360RevisionResult, stationItemsResult]);
  }

  private async fetchImageRevisions(collectionToStationEdgeItems: EdgeItem[], space: string): Promise<any> {
    const revisionSource: Source = { externalId: 'Image360Revision', space, type: 'view', version: '1' };
    const filter = {
      containsAny: {
        property: ['edge', 'startNode'],
        values: collectionToStationEdgeItems.map(edgeItem => edgeItem.endNode)
      }
    };
    const stationToRevisionEdgeItems = await this._dmsSDK.filterInstances(filter, 'edge');
    const fetchRevisionItems: Item[] = stationToRevisionEdgeItems.map(edgeItem => {
      return {
        instanceType: 'node',
        ...edgeItem.endNode
      };
    });
    const revisionItemsResult = this._dmsSDK.getInstancesByExternalIds<Image360RevisionResult>(
      fetchRevisionItems,
      revisionSource
    );

    const image360Revisions = await revisionItemsResult;
    await this.fetchRevisionImageData(image360Revisions, space);
  }
  public async fetchRevisionImageData(image360Revisions: Image360RevisionResult[], space: string): Promise<any> {
    const cubeMapSource: Source = { externalId: 'CubeMap', space, type: 'view', version: '1' };
    const vec3dSource: Source = { externalId: 'Vec3d', space, type: 'view', version: '1' };

    const cubeMapItems: Item[] = image360Revisions.map(revision => {
      return { instanceType: 'node', ...revision.cubeMap };
    });

    const eulerRotationItems: Item[] = image360Revisions.map(revision => {
      return { instanceType: 'node', ...revision.eulerRotation };
    });

    const translationItems: Item[] = image360Revisions.map(revision => {
      return { instanceType: 'node', ...revision.eulerRotation };
    });

    const cubeMapResult = this._dmsSDK.getInstancesByExternalIds<CubeMap>(cubeMapItems, cubeMapSource);
    const eulerRotationResult = this._dmsSDK.getInstancesByExternalIds<Vec3d>(eulerRotationItems, vec3dSource);
    const translationResult = this._dmsSDK.getInstancesByExternalIds<Vec3d>(translationItems, vec3dSource);

    const [cubeMaps, rotation, translation] = await Promise.all([
      cubeMapResult,
      eulerRotationResult,
      translationResult
    ]);
    console.log(cubeMaps);
  }

  private async createHistorical360ImageSet(
    image360Station: Image360Station,
    collectionId: string,
    collectionLabel: string
  ): Promise<Historical360ImageSet> {
    const revisions = image360Station.revisions.items;

    assert(revisions.length >= 0, 'Expected at least one revision to be returned from the query');

    const primaryRevision = revisions[0];
    const primaryRevisionTransform = this.getRevisionTransform(primaryRevision);

    const image360Descriptor: Image360EventDescriptor = {
      collectionId,
      collectionLabel,
      id: image360Station.externalId,
      label: image360Station.label,
      transform: primaryRevisionTransform
    };

    const imageRevisions = await Promise.all(revisions.map(revision => this.getRevisionDescriptor(revision)));

    return { ...image360Descriptor, imageRevisions };
  }

  private getRevisionTransform(revision: Image360Revision): Matrix4 {
    const transform = getTranslation();
    transform.multiply(getEulerRotation());
    return transform;

    function getEulerRotation(): Matrix4 {
      const { x, y, z } = revision.eulerRotation;
      const eulerRotation = new Euler(x, z, -y, 'XYZ');
      return new Matrix4().makeRotationFromEuler(eulerRotation);
    }

    function getTranslation(): Matrix4 {
      const { x, y, z } = revision.translation;
      return new Matrix4().makeTranslation(x, z, -y);
    }
  }

  private async getRevisionDescriptor(revision: Image360Revision): Promise<Image360Descriptor> {
    const faceDescriptors: Image360FileDescriptor[] = Object.entries(revision.cubeMap).map(
      ([faceKey, fileMetadata]) => {
        const face = faceKey as Image360FileDescriptor['face'];
        return { face, fileId: fileMetadata.id, mimeType: fileMetadata.mimeType };
      }
    );

    return {
      timestamp: revision.timeTaken ?? undefined,
      faceDescriptors
    };
  }
}

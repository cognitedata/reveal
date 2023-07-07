/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, InternalId } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360FileDescriptor,
  Image360EventDescriptor,
  Image360DescriptorProvider,
  Image360Descriptor
} from '../types';
import { Euler, Matrix4 } from 'three';
import assert from 'assert';
import { DmsSDK, EdgeItem, Item, Source } from './DmsSdk';
import zip from 'lodash/zip';
import chunk from 'lodash/chunk';

export type DM360CollectionIdentifier = {
  space: string;
  image360CollectionExternalId: string;
};

type Image360Station = {
  externalId: string;
  label: string;
  revisions: {
    items: Image360Revision[];
  };
};

type Image360RevisionSharedData = {
  externalId: string;
  label?: string;
  timeTaken?: number;
  eulerRotationX: number;
  eulerRotationY: number;
  eulerRotationZ: number;
  translationX: number;
  translationY: number;
  translationZ: number;
};

type Image360RevisionDmsResult = Image360RevisionSharedData & {
  cubeMapBack: string;
  cubeMapBottom: string;
  cubeMapFront: string;
  cubeMapLeft: string;
  cubeMapRight: string;
  cubeMapTop: string;
};

type Image360Revision = Image360RevisionSharedData & {
  cubeMapBack: InternalId;
  cubeMapBottom: InternalId;
  cubeMapFront: InternalId;
  cubeMapLeft: InternalId;
  cubeMapRight: InternalId;
  cubeMapTop: InternalId;
};

export class Cdf360FdmProvider implements Image360DescriptorProvider<DM360CollectionIdentifier> {
  private readonly _dmsSDK: DmsSDK;
  private readonly _cogniteSdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._dmsSDK = new DmsSDK(sdk);
    this._cogniteSdk = sdk;
  }
  public async get360ImageDescriptors(
    metadataFilter: DM360CollectionIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet[]> {
    const start = performance.now();
    const cols = await this.fetchImageCollection(metadataFilter);
    console.log(`Fetched ${cols.length} collections in ${performance.now() - start} ms`);
    return cols;
  }

  private async fetchImageCollection(metadataFilter: DM360CollectionIdentifier): Promise<Historical360ImageSet[]> {
    const { space, image360CollectionExternalId } = metadataFilter;

    const image360CollectionSource: Source = { externalId: 'Image360Collection', space, type: 'view', version: '1' };
    const image360CollectionItem: Item = { externalId: image360CollectionExternalId, instanceType: 'node', space };

    const image360CollectionResult = this._dmsSDK.getInstancesByExternalIds<{ label: string }>(
      [image360CollectionItem],
      image360CollectionSource
    );
    const image360StationsResult = this.fetchImageStations(image360CollectionExternalId, space);

    const [image360Collection, image360Stations] = await Promise.all([
      image360CollectionResult,
      image360StationsResult
    ]);

    const collectionId = image360Collection[0].externalId;
    const collectionLabel = image360Collection[0].label;

    return Promise.all(
      image360Stations.map(station => {
        return this.createHistorical360ImageSet(station, collectionId, collectionLabel);
      })
    );
  }

  private async fetchImageStations(collectionExternalId: string, space: string): Promise<Image360Station[]> {
    const filter = {
      equals: {
        property: ['edge', 'startNode'],
        value: { externalId: collectionExternalId, space }
      }
    };

    let hasNext = true;
    let nextSetCursor: string | undefined = undefined;

    const stations: Promise<Image360Station[]>[] = [];
    while (hasNext) {
      const { edges: collectionToStationEdgeItems, nextCursor } = await this._dmsSDK.filterInstances(
        filter,
        'edge',
        undefined,
        nextSetCursor
      );
      stations.push(this.fetchStationData(collectionToStationEdgeItems, space));

      nextSetCursor = nextCursor;
      hasNext = nextCursor !== undefined && collectionToStationEdgeItems.length === 1000;

      //Avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return (await Promise.all(stations)).flatMap(p => p);
  }

  private async fetchStationData(collectionToStationEdgeItems: EdgeItem[], space: string): Promise<Image360Station[]> {
    const stationSource: Source = { externalId: 'Image360Station', space, type: 'view', version: '1' };

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

    const [stationIdToRevisionMap, stationsResult] = await Promise.all([image360RevisionResult, stationItemsResult]);

    return stationsResult.map(stationItem => {
      const stationId = stationItem.externalId;
      const image360Revisions = stationIdToRevisionMap.get(stationId);
      assert(image360Revisions !== undefined);
      return {
        ...stationItem,
        revisions: {
          items: image360Revisions
        }
      };
    });
  }

  private async fetchImageRevisions(
    collectionToStationEdgeItems: EdgeItem[],
    space: string
  ): Promise<Map<string, Image360Revision[]>> {
    const revisionSource: Source = { externalId: 'Image360Revision', space, type: 'view', version: '1' };
    const filter = {
      containsAny: {
        property: ['edge', 'startNode'],
        values: collectionToStationEdgeItems.map(edgeItem => edgeItem.endNode)
      }
    };
    const { edges: stationToRevisionEdgeItems } = await this._dmsSDK.filterInstances(filter, 'edge');
    const fetchRevisionItems: Item[] = stationToRevisionEdgeItems.map(edgeItem => {
      return {
        instanceType: 'node',
        ...edgeItem.endNode
      };
    });

    const revisionIdToStationIdMap = new Map<string, string>();
    stationToRevisionEdgeItems.forEach(edgeItem => {
      revisionIdToStationIdMap.set(edgeItem.endNode.externalId, edgeItem.startNode.externalId);
    });

    const image360RevisionsResult = await this._dmsSDK.getInstancesByExternalIds<Image360RevisionDmsResult>(
      fetchRevisionItems,
      revisionSource
    );

    const fileIds = image360RevisionsResult.flatMap(revision => [
      { externalId: revision.cubeMapBack },
      { externalId: revision.cubeMapFront },
      { externalId: revision.cubeMapLeft },
      { externalId: revision.cubeMapRight },
      { externalId: revision.cubeMapTop },
      { externalId: revision.cubeMapBottom }
    ]);

    const files = (
      await Promise.all(
        chunk(fileIds, 1000).map(fileIdsChunk => {
          return this._cogniteSdk.files.retrieve(fileIdsChunk);
        })
      )
    ).flatMap(p => p);

    const image360Revisions: Image360Revision[] = zip(image360RevisionsResult, chunk(files, 6)).map(
      ([revision, file]) => {
        return {
          ...revision!,
          cubeMapBack: { id: file![0].id },
          cubeMapFront: { id: file![1].id },
          cubeMapLeft: { id: file![2].id },
          cubeMapRight: { id: file![3].id },
          cubeMapTop: { id: file![4].id },
          cubeMapBottom: { id: file![5].id }
        };
      }
    );

    const stationIdToRevisionMap = new Map<string, Image360Revision[]>();

    image360Revisions.forEach(revisionResult => {
      const stationId = revisionIdToStationIdMap.get(revisionResult.externalId);
      if (!stationId) {
        throw new Error('Station id not found');
      }

      const revisions = stationIdToRevisionMap.get(stationId) ?? [];
      revisions.push(revisionResult);
      stationIdToRevisionMap.set(stationId, revisions);
    });

    return stationIdToRevisionMap;
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
      const [x, y, z] = [revision.eulerRotationX, revision.eulerRotationY, revision.eulerRotationZ];
      const eulerRotation = new Euler(x, z, -y, 'XYZ');
      return new Matrix4().makeRotationFromEuler(eulerRotation);
    }

    function getTranslation(): Matrix4 {
      const [x, y, z] = [revision.translationX, revision.translationY, revision.translationZ];
      return new Matrix4().makeTranslation(x, z, -y);
    }
  }

  private async getRevisionDescriptor(revision: Image360Revision): Promise<Image360Descriptor> {
    const faceDescriptors: Image360FileDescriptor[] = Object.entries(revision)
      .filter((revisionEntry): revisionEntry is [string, InternalId] => revisionEntry[0].includes('cubeMap'))
      .map(
        ([cubeMapKey, fileInternalId]) =>
          [cubeMapKey.replace('cubeMap', '').toLowerCase(), fileInternalId] as [string, InternalId]
      )
      .map(([faceKey, fileInternalId]) => {
        const face = faceKey as Image360FileDescriptor['face'];
        return { face, fileId: fileInternalId, mimeType: 'image/jpeg' };
      });

    return {
      timestamp: revision.timeTaken ?? undefined,
      faceDescriptors
    };
  }
}

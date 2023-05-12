/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360FileDescriptor,
  Image360EventDescriptor,
  Image360DescriptorProvider
} from '../types';
import { listAll360ImageCollectionsQuery } from './listCollections';
import { Matrix4 } from 'three';
import zip from 'lodash/zip';

export type FdmIdentifier = {
  space: string;
  dataModelExternalId: string;
  image360CollectionExternalId: string;
};

type CubeMap = {
  back: string;
  bottom: string;
  front: string;
  left: string;
  right: string;
  top: string;
};

type Image360EntityResult = {
  label: string;
  translation: { x: number; y: number; z: number };
  eulerRotation: { x: number; y: number; z: number };
  cubeMap: CubeMap;
  externalId: string;
};

type Image360CollectionResult = {
  entities: { items: Image360EntityResult[] };
  label: string;
  externalId: string;
};

type Edge = { node: Image360CollectionResult };

type ListConnectionsImage360Collection = { edges: Edge[] };

type JSONData = { listConnectionsImage360Collection: ListConnectionsImage360Collection };

export class Cdf360FdmProvider implements Image360DescriptorProvider<FdmIdentifier> {
  private readonly _sdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }
  public async get360ImageDescriptors(metadataFilter: FdmIdentifier, _: boolean): Promise<Historical360ImageSet[]> {
    const { dataModelExternalId, space } = metadataFilter;

    const baseUrl = this._sdk.getBaseUrl();
    const project = this._sdk.project;
    const graphQlEndpoint = `${baseUrl}/api/v1/projects/${project}/userapis/spaces/${space}/datamodels/${dataModelExternalId}/versions/1/graphql`;

    const result = await this._sdk.post(graphQlEndpoint, { data: { query: listAll360ImageCollectionsQuery } });
    const data = result.data.data as JSONData;

    const collectionId = data.listConnectionsImage360Collection.edges[0].node.externalId;
    const collectionLabel = data.listConnectionsImage360Collection.edges[0].node.label;

    const image360Entities = data.listConnectionsImage360Collection.edges[0].node.entities.items;

    const imgs = await Promise.all(
      image360Entities.map(p => this.createHistorical360ImageSet(p, collectionId, collectionLabel))
    );
    return imgs;
  }

  private async createHistorical360ImageSet(
    image360EventResult: Image360EntityResult,
    collectionId: string,
    collectionLabel: string
  ): Promise<Historical360ImageSet> {
    const entity: Image360EventDescriptor = {
      collectionId,
      collectionLabel,
      id: image360EventResult.externalId,
      label: image360EventResult.label,
      transform: new Matrix4()
    };
    const faceExternalIds = Object.entries(image360EventResult.cubeMap).map(([face, fileExternalId]) => {
      return { face, fileExternalId };
    });

    const fileInfos = await this._sdk.files.retrieve(
      faceExternalIds.map(p => {
        return { externalId: p.fileExternalId };
      })
    );

    const image360FileDescriptors = zip(faceExternalIds, fileInfos).map(([a, b]) => {
      const q: Image360FileDescriptor = {
        face: a!.face as Image360FileDescriptor['face'],
        fileId: b!.id!,
        mimeType: b!.mimeType as Image360FileDescriptor['mimeType']
      };
      return q;
    });

    return { ...entity, imageRevisions: [{ faceDescriptors: image360FileDescriptors }] };
  }
}

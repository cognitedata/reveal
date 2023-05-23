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
import { get360ImageCollectionsQuery } from './listCollections';
import { Euler, Matrix4 } from 'three';
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

type Image360CollectionJsonData = { edges: Edge[]; items: { label: string }[] };

type JSONData = { getConnectionsImage360CollectionById: Image360CollectionJsonData };

export class Cdf360FdmProvider implements Image360DescriptorProvider<FdmIdentifier> {
  private readonly _sdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }
  public async get360ImageDescriptors(metadataFilter: FdmIdentifier, _: boolean): Promise<Historical360ImageSet[]> {
    const { dataModelExternalId, space, image360CollectionExternalId } = metadataFilter;

    const baseUrl = this._sdk.getBaseUrl();
    const project = this._sdk.project;
    const graphQlEndpoint = `${baseUrl}/api/v1/projects/${project}/userapis/spaces/${space}/datamodels/${dataModelExternalId}/versions/1/graphql`;

    const result = await this._sdk.post(graphQlEndpoint, {
      data: { query: get360ImageCollectionsQuery(image360CollectionExternalId, space) }
    });

    const data = result.data.data as JSONData;
    console.log(data, null, 2);

    const collectionId = data.getConnectionsImage360CollectionById.edges[0].node.externalId;
    const collectionLabel = data.getConnectionsImage360CollectionById.edges[0].node.label;

    const image360Entities = data.getConnectionsImage360CollectionById.edges[0].node.entities.items;

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
    const descriptor = this.getImage360Descriptor(collectionId, collectionLabel, image360EventResult);
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

    return { ...descriptor, imageRevisions: [{ faceDescriptors: image360FileDescriptors }] };
  }

  private getImage360Descriptor(
    collectionId: string,
    collectionLabel: string,
    image360EventResult: Image360EntityResult
  ): Image360EventDescriptor {
    const transform = getTranslation();
    transform.multiply(getEulerRotation());
    // TODO: convert from CDF space to threejs;
    return {
      collectionId,
      collectionLabel,
      id: image360EventResult.externalId,
      label: image360EventResult.label,
      transform
    };

    function getEulerRotation(): Matrix4 {
      const { x, y, z } = image360EventResult.eulerRotation;
      const eulerRotation = new Euler(x, y, z, 'XYZ');
      return new Matrix4().makeRotationFromEuler(eulerRotation);
    }

    function getTranslation(): Matrix4 {
      const { x, y, z } = image360EventResult.translation;
      return new Matrix4().makeTranslation(x, y, z);
    }
  }
}

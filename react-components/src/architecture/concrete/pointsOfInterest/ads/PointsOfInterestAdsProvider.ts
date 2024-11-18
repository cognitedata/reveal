/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type ExternalId } from '../../../../data-providers/FdmSDK';
import {
  type CommentProperties,
  type PointsOfInterestInstance,
  type PointsOfInterestProperties
} from '../models';
import { type PointsOfInterestProvider } from '../PointsOfInterestProvider';

import { v4 as uuid } from 'uuid';
import { type PoiItem } from './types';

/**
 * A PoI provider using the Cognite Application Data Storage service as backing storage
 */
export class PointsOfInterestAdsProvider implements PointsOfInterestProvider<ExternalId> {
  private readonly _createUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi`;

  private readonly _listUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/list`;

  private readonly _deleteUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/delete`;

  private readonly _getCommentsUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/comment/list`;

  private readonly _postCommentUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/comment`;

  private readonly _byidsUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/byids`;

  constructor(private readonly _sdk: CogniteClient) {}

  async createPointsOfInterest(
    pois: { id: ExternalId; properties: PointsOfInterestProperties }[]
  ): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const result = await this._sdk.put<{ items: PoiItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._createUrl(this._sdk.project)}`,
      {
        data: {
          items: pois.map(({ id, properties: poi }) => {
            return {
              externalId: id,
              name: poi.title,
              position: [poi.positionX, poi.positionY, poi.positionZ],
              sceneState: {},
              visibility: 'PRIVATE'
            };
          })
        }
      }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while creating points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    return result.data.items.map(poiItemToInstance);
  }

  async fetchAllPointsOfInterest(): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const result = await this._sdk.post<{ items: PoiItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._listUrl(this._sdk.project)}`,
      { data: { filter: {} } }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while fetching points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    return result.data.items.map(poiItemToInstance);
  }

  async deletePointsOfInterest(poiIds: ExternalId[]): Promise<void> {
    const result = await this._sdk.post<Record<never, never>>(
      `${this._sdk.getBaseUrl()}/${this._deleteUrl(this._sdk.project)}`,
      {
        data: { items: poiIds.map((id) => ({ externalId: id })) }
      }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while deleting points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }
  }

  async getPointsOfInterestComments(poiId: ExternalId): Promise<CommentProperties[]> {
    const result = await this._sdk.post<CommentProperties[]>(
      `${this._sdk.getBaseUrl()}/${this._getCommentsUrl(this._sdk.project)}`,
      { data: { externalId: poiId } }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while fetching points of interest comments: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    return result.data;
  }

  async postPointsOfInterestComment(
    poiId: ExternalId,
    content: string
  ): Promise<CommentProperties> {
    const result = await this._sdk.post<{ content: string; ownerId: string }>(
      `${this._sdk.getBaseUrl()}/${this._postCommentUrl(this._sdk.project)}`,
      { data: { poi3dExternalId: poiId, content } }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured occured while posting points of interest comment: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    return result.data;
  }

  public createNewId(): ExternalId {
    return uuid();
  }
}

function poiItemToInstance(item: PoiItem): PointsOfInterestInstance<ExternalId> {
  return {
    id: item.externalId,
    properties: {
      title: item.name,
      positionX: item.position[0],
      positionY: item.position[1],
      positionZ: item.position[2]
    }
  };
}

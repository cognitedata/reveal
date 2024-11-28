/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type DmsUniqueIdentifier, type ExternalId } from '../../../../data-providers/FdmSDK';
import { type CommentProperties, type PointsOfInterestInstance } from '../models';
import { type PointsOfInterestProvider } from '../PointsOfInterestProvider';

import { v4 as uuid } from 'uuid';
import { type PoiItem } from './types';
import { isDefined } from '../../../../utilities/isDefined';
import { uniq } from 'lodash';
import { createUpsertRequestFromPois } from './createUpsertRequestFromPois';

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

  async upsertPointsOfInterest(
    pois: Array<PointsOfInterestInstance<ExternalId>>
  ): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const upsertRequestData = createUpsertRequestFromPois(pois);

    const result = await this._sdk.put<{ items: PoiItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._createUrl(this._sdk.project)}`,
      {
        data: upsertRequestData
      }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while creating points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    return result.data.items.map(poiItemToInstance);
  }

  async fetchPointsOfInterest(
    scene?: DmsUniqueIdentifier
  ): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const result = await this._sdk.post<{ items: PoiItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._listUrl(this._sdk.project)}`,
      { data: { filter: { scene } } }
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

    const userIdNameMap = await this.createUserMap(result.data.map((comment) => comment.ownerId));

    result.data.forEach((comment) => {
      const name = userIdNameMap.get(comment.ownerId) ?? 'Unknown';
      comment.ownerId = name;
    });

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

  private async createUserMap(userIds: string[]): Promise<Map<string, string | undefined>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const uniqueUserIds = uniq(userIds);

    const profiles = await this._sdk.profiles.retrieve(
      uniqueUserIds.map((id) => ({ userIdentifier: id }))
    );

    const idNamePairs = profiles
      .filter(isDefined)
      .map((profile) => [profile.userIdentifier, profile.displayName ?? undefined] as const);

    return new Map(idNamePairs);
  }
}

function poiItemToInstance(item: PoiItem): PointsOfInterestInstance<ExternalId> {
  return {
    id: item.externalId,
    properties: {
      title: item.name,
      positionX: item.position[0],
      positionY: item.position[1],
      positionZ: item.position[2],
      visibility: item.visibility
    }
  };
}

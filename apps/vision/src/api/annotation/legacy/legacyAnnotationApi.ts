import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { HttpResponse, ItemsResponse } from '@cognite/sdk';

import {
  LegacyAnnotation,
  LegacyAnnotationCreateRequest,
  LegacyAnnotationListRequest,
  LegacyAnnotationUpdateRequest,
} from './legacyTypes';

/**
 * @deprecated The legacy annotations back-end is deprecated, and will be removed on Oct 31, 2023.
 * Call the v1 (stable) back-end instead.
 */
export class LegacyAnnotationApi {
  public static listCursor = async (
    request: LegacyAnnotationListRequest
  ): Promise<{
    items: LegacyAnnotation[];
    nextCursor?: string;
  }> => {
    const { limit } = request;
    if (limit !== null && limit !== undefined && limit < 1) {
      console.error('Limit can not be smaller than 1');
    }

    const response = await sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${getProject()}/context/annotations/list`,
      { data: request }
    );

    return {
      items: response.data.items,
      ...(response.data.nextCursor
        ? { nextCursor: response.data.nextCursor }
        : {}),
    };
  };

  /**
   * @deprecated Use the `annotations.list` endpoint from the Cognite stable SDK instead
   */
  public static list = async (
    request: LegacyAnnotationListRequest
  ): Promise<LegacyAnnotation[]> => {
    const { limit } = request;
    const limitVar = limit === -1 ? undefined : limit;
    const result: LegacyAnnotation[] = [];
    let remaining: number | undefined = limitVar;
    let cursor: string | undefined;
    let currentLimit = 1000;

    while (remaining === undefined || remaining > 0) {
      if (remaining !== undefined) {
        currentLimit = Math.min(currentLimit, remaining);
      }

      // eslint-disable-next-line no-await-in-loop
      const response = await LegacyAnnotationApi.listCursor({
        limit: currentLimit,
        cursor,
        filter: request.filter,
      });
      result.push(...response.items);
      if (response.nextCursor === undefined) {
        break;
      }
      cursor = response.nextCursor;
      if (remaining !== undefined) {
        remaining -= response.items.length;
      }
    }
    return result;
  };

  /**
   * @deprecated Use the `annotations.create` or `annotations.suggest` endpoint from the Cognite stable SDK instead
   */
  public static create(
    request: LegacyAnnotationCreateRequest
  ): Promise<HttpResponse<ItemsResponse<LegacyAnnotation>>> {
    const data = { data: request };
    return sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${getProject()}/context/annotations`,
      data
    );
  }

  /**
   * @deprecated Use the `annotations.update` endpoint from the Cognite stable SDK instead
   */
  public static update(
    request: LegacyAnnotationUpdateRequest
  ): Promise<HttpResponse<ItemsResponse<LegacyAnnotation>>> {
    const data = { data: request };
    return sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${getProject()}/context/annotations/update`,
      data
    );
  }
}

import sdk from '@cognite/cdf-sdk-singleton';
import { HttpResponse, ItemsResponse } from '@cognite/sdk';
import {
  LegacyAnnotation,
  LegacyAnnotationCreateRequest,
  LegacyAnnotationListRequest,
  LegacyAnnotationUpdateRequest,
} from './legacyTypes';

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
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/annotations/list`,
      { data: request }
    );

    return {
      items: response.data.items,
      ...(response.data.nextCursor
        ? { nextCursor: response.data.nextCursor }
        : {}),
    };
  };

  public static list = async (
    request: LegacyAnnotationListRequest
  ): Promise<LegacyAnnotation[]> => {
    const { limit } = request;
    const limitVar = limit === -1 ? undefined : limit;
    const result: LegacyAnnotation[] = [];
    let remaining: number | undefined = limitVar;
    let cursor: string | undefined;
    let currentLimit: number = 1000;

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

  public static create(
    request: LegacyAnnotationCreateRequest
  ): Promise<HttpResponse<ItemsResponse<LegacyAnnotation>>> {
    const data = { data: request };
    return sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/annotations`,
      data
    );
  }

  public static update(
    request: LegacyAnnotationUpdateRequest
  ): Promise<HttpResponse<ItemsResponse<LegacyAnnotation>>> {
    const data = { data: request };
    return sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/annotations/update`,
      data
    );
  }
}

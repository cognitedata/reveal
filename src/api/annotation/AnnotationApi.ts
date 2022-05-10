import sdk from '@cognite/cdf-sdk-singleton';
import {
  AnnotationListRequest,
  CDFAnnotationTypeEnum,
  CDFAnnotationV2,
} from 'src/api/annotation/types';

export class AnnotationApi {
  public static listCursor = async (
    request: AnnotationListRequest
  ): Promise<{
    items: CDFAnnotationV2<CDFAnnotationTypeEnum>[];
    nextCursor?: string;
  }> => {
    const { limit } = request;
    if (limit !== null && limit !== undefined && limit < 1) {
      console.error('Limit can not be smaller than 1');
    }

    const response = await sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/annotations/list`,
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
    request: AnnotationListRequest
  ): Promise<CDFAnnotationV2<CDFAnnotationTypeEnum>[]> => {
    const { limit } = request;
    const limitVar = limit === -1 ? undefined : limit;
    const result: CDFAnnotationV2<CDFAnnotationTypeEnum>[] = [];
    let remaining: number | undefined = limitVar;
    let cursor: string | undefined;
    let currentLimit: number = 1000;

    while (remaining === undefined || remaining > 0) {
      if (remaining !== undefined) {
        currentLimit = Math.min(currentLimit, remaining);
      }

      // eslint-disable-next-line no-await-in-loop
      const response = await AnnotationApi.listCursor({
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
}

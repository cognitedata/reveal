import {
  HttpResponse,
  ItemsResponse,
  v3Client as sdk,
} from '@cognite/cdf-sdk-singleton';
import { Annotation } from 'src/api/types';
import {
  AnnotationCreateRequest,
  AnnotationListRequest,
  AnnotationUpdateRequest,
} from 'src/api/annotation/types';

export class AnnotationApi {
  public static list(
    request: AnnotationListRequest
  ): Promise<HttpResponse<ItemsResponse<Annotation>>> {
    const data = { data: request };
    return sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/annotations/list`,
      data
    );
  }

  public static create(
    request: AnnotationCreateRequest
  ): Promise<HttpResponse<ItemsResponse<Annotation>>> {
    const data = { data: request };
    return sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/annotations`,
      data
    );
  }

  public static update(
    request: AnnotationUpdateRequest
  ): Promise<HttpResponse<ItemsResponse<Annotation>>> {
    const data = { data: request };
    return sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/annotations/update`,
      data
    );
  }
}

/*!
 * Copyright 2022 Cognite AS
 */
import { ListResponse } from '@cognite/sdk-core';

/**
 * Unit test helper for creating {@link ListResponse} from various {@link CogniteClient}-APIs.
 * @param items             Items to return
 * @param pageSize          How many items each "page" should contain
 * @param nextPageCallback  Optional callback triggered during paging.
 * @returns
 */
export function createListResponse<T>(
  items: T[],
  pageSize: number,
  nextPageCallback?: () => Promise<void>
): ListResponse<T[]> {
  function createPage(offset: number): ListResponse<T[]> {
    const page: ListResponse<T[]> = {
      items: items.slice(offset, offset + pageSize),
      nextCursor: items.length > offset + pageSize ? 'cursor' : undefined,
      next:
        items.length > offset + pageSize
          ? async () => {
              if (nextPageCallback !== undefined) {
                await nextPageCallback();
              }
              return createPage(offset + pageSize);
            }
          : undefined
    };
    return page;
  }
  return createPage(0);
}

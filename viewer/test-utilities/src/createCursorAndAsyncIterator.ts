/*!
 * Copyright 2025 Cognite AS
 */

import { ListResponse, CursorAndAsyncIterator, CogniteAsyncIterator } from '@cognite/sdk';
import { Mock } from 'moq.ts';

export function createCursorAndAsyncIterator<T>(response: ListResponse<T[]>): CursorAndAsyncIterator<T> {
  return Object.assign(Promise.resolve(response), new Mock<CogniteAsyncIterator<T>>().object(), {
    autoPagingToArray: () => Promise.resolve(response.items)
  });
}

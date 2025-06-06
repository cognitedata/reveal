import { CogniteAsyncIterator, CursorAndAsyncIterator, ListResponse } from '@cognite/sdk';
import { Mock } from 'moq.ts';

export function createCursorAndAsyncIteratorMock<T>(
  response: ListResponse<T[]>
): CursorAndAsyncIterator<T> {
  return Object.assign(Promise.resolve(response), new Mock<CogniteAsyncIterator<T>>().object(), {
    autoPagingToArray: () => response.items
  });
}

import { FetchHeaders, fetchPatch } from 'utils/fetch';

import { updateFavoriteContent } from '../updateFavoriteContent';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const id = '12345';
const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('updateFavoriteContent', () => {
  it('should call `fetchPatch` on `updateFavoriteContent` as expected', async () => {
    await updateFavoriteContent(id, {}, headers, project);
    expect(fetchPatch).toBeCalledTimes(1);
  });
});

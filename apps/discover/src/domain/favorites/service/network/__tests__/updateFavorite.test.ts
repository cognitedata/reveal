import { FetchHeaders, fetchPatch } from 'utils/fetch';

import { updateFavorite } from '../updateFavorite';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const id = '12345';
const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('updateFavorite', () => {
  it('should call `fetchPatch` on `update` as expected', async () => {
    await updateFavorite(id, {}, headers, project);
    expect(fetchPatch).toBeCalledTimes(1);
  });
});

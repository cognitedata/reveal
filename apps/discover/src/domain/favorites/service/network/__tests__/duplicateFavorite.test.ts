import { FetchHeaders, fetchPost } from 'utils/fetch';

import { FavoritePostSchema } from '@cognite/discover-api-types';

import { duplicateFavorite } from '../duplicateFavorite';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const id = '12345';
const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('duplicateFavorite', () => {
  it('should call `fetchPost` on `duplicate` as expected', async () => {
    const payload: FavoritePostSchema = { name: 'test-name' };

    await duplicateFavorite(id, payload, headers, project);
    expect(fetchPost).toBeCalledTimes(1);
  });
});

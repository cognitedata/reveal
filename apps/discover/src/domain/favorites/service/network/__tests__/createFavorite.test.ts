import { FetchHeaders, fetchPost } from 'utils/fetch';

import { FavoritePostSchema } from '@cognite/discover-api-types';

import { createFavorite } from '../createFavorite';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const name = 'test-name';
const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('createFavorite', () => {
  it('should call `fetchPost` on `create` as expected', async () => {
    const payload: FavoritePostSchema = { name };

    await createFavorite(payload, headers, project);
    expect(fetchPost).toBeCalledTimes(1);
  });
});

import {
  fetchDelete,
  fetchGet,
  FetchHeaders,
  fetchPatch,
  fetchPost,
} from 'utils/fetch';

import { FavoritePostSchema } from '@cognite/discover-api-types';

import { favorites } from '../favorites';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const id = '12345';
const name = 'test-name';
const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('favorites api', () => {
  it('should call `fetchPost` on `create` as expected', async () => {
    const payload: FavoritePostSchema = { name };

    await favorites.create(payload, headers, project);
    expect(fetchPost).toBeCalledTimes(1);
  });

  it('should call `fetchPatch` on `update` as expected', async () => {
    await favorites.update(id, {}, headers, project);
    expect(fetchPatch).toBeCalledTimes(1);
  });

  it('should call `fetchPatch` on `updateFavoriteContent` as expected', async () => {
    await favorites.updateFavoriteContent(id, {}, headers, project);
    expect(fetchPatch).toBeCalledTimes(1);
  });

  it('should call `fetchGet` on `getOne` as expected', async () => {
    await favorites.getOne(id, headers, project);
    expect(fetchGet).toBeCalledTimes(1);
  });

  it('should call `fetchGet` on `list` as expected', async () => {
    await favorites.list(headers, project);
    expect(fetchGet).toBeCalledTimes(1);
  });

  it('should call `fetchDelete` on `delete` as expected', async () => {
    await favorites.delete(id, headers, project);
    expect(fetchDelete).toBeCalledTimes(1);
  });

  it('should call `fetchPost` on `duplicate` as expected', async () => {
    const payload: FavoritePostSchema = { name: 'test-name' };

    await favorites.duplicate(id, payload, headers, project);
    expect(fetchPost).toBeCalledTimes(1);
  });

  it('should call `fetchPost` on `share` as expected', async () => {
    await favorites.share({ id, shareWithUsers: [] }, headers, project);
    expect(fetchPost).toBeCalledTimes(1);
  });
});

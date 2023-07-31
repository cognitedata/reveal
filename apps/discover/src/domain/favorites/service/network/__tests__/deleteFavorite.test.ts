import { fetchDelete, FetchHeaders } from 'utils/fetch';

import { deleteFavorite } from '../deleteFavorite';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const id = '12345';
const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('favorites api', () => {
  it('should call `fetchDelete` on `delete` as expected', async () => {
    await deleteFavorite(id, headers, project);
    expect(fetchDelete).toBeCalledTimes(1);
  });
});

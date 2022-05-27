import { fetchGet, FetchHeaders } from 'utils/fetch';

import { getFavorite } from '../getFavorite';

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
  it('should call `fetchGet` on `getOne` as expected', async () => {
    await getFavorite(id, headers, project);
    expect(fetchGet).toBeCalledTimes(1);
  });
});

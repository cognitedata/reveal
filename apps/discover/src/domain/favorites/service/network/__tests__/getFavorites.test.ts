import { fetchGet, FetchHeaders } from 'utils/fetch';

import { getFavorites } from '../getFavorites';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('favorites api', () => {
  it('should call `fetchGet` on `list` as expected', async () => {
    await getFavorites(headers, project);
    expect(fetchGet).toBeCalledTimes(1);
  });
});

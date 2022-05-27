import { FetchHeaders, fetchPost } from 'utils/fetch';

import { shareFavorite } from '../shareFavorite';

jest.mock('utils/fetch', () => ({
  fetchDelete: jest.fn(),
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const id = '12345';
const headers: FetchHeaders = { header: 'test-header' };
const project = 'test-project';

describe('shareFavorite', () => {
  it('should call `fetchPost` on `share` as expected', async () => {
    await shareFavorite({ id, shareWithUsers: [] }, headers, project);
    expect(fetchPost).toBeCalledTimes(1);
  });
});

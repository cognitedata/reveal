import { fetchGet, FetchHeaders, fetchPatch, fetchPost } from '_helpers/fetch';

import { feedback } from '../service';
import { FeedbackType } from '../types';

jest.mock('_helpers/fetch', () => ({
  fetchGet: jest.fn(),
  fetchPatch: jest.fn(),
  fetchPost: jest.fn(),
}));

const id = '12345';
const feedbackType: FeedbackType = 'general';
const headers: FetchHeaders = { header: 'test-header' };

describe('feedback api', () => {
  it('should call `fetchGet` on `get` as expected', async () => {
    await feedback.get(feedbackType, headers);
    expect(fetchGet).toBeCalledTimes(1);
  });

  it('should call `fetchGet` on `getOne` as expected', async () => {
    await feedback.getOne(feedbackType, id, headers);
    expect(fetchGet).toBeCalledTimes(1);
  });

  it('should call `fetchPost` on `create` as expected', async () => {
    const payload: Record<string, unknown> = { key: 'test' };

    await feedback.create(feedbackType, payload, headers);
    expect(fetchPost).toBeCalledTimes(1);
  });

  it('should call `fetchPatch` on `update` as expected', async () => {
    const payload: Record<string, unknown> = { key: 'test' };
    const data = { id, payload };

    await feedback.update(feedbackType, data, headers);
    expect(fetchPatch).toBeCalledTimes(1);
  });
});

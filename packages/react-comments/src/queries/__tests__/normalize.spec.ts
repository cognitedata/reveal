import { getComment } from '__test_utils__/getComment';

import { normalizeComment } from '../normalize';

describe('normalize', () => {
  it('should be ok', () => {
    expect(normalizeComment(getComment())).toEqual({
      id: 'test-id',
      text: 'test-comment',
      timestamp: 1629963552092,
      user: 'test-_owner',
    });
  });
});

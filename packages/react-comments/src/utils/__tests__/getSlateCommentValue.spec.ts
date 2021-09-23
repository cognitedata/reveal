import { getMessage } from '__test_utils__/getComment';

import { getSlateCommentValue } from '../getSlateCommentValue';

describe('getSlateCommentValue', () => {
  it('should be ok', () => {
    expect(getSlateCommentValue(getMessage().text)).toMatchObject([
      { children: [{ text: 'test-comment' }], type: 'paragraph' },
    ]);
  });
});

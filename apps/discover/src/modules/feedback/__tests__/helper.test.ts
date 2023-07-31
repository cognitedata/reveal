import { GeneralFeedbackResponse } from '@cognite/discover-api-types';

import { feedbackHelper, generateReplyToUserContent } from '../helper';

const now = new Date().toISOString();

describe('feedbackHelper', () => {
  const string = 'This is a very cool test case';
  it('string smaller than minNumberCharacters is returned without modification', () => {
    const result = feedbackHelper.shortCommentText(string, 35, 45);

    expect(result).toBe('This is a very cool test case');
  });

  it('reduce string and add ellipsis if string is larger than minNumberCharacters', () => {
    const result = feedbackHelper.shortCommentText(string, 15, 25);

    expect(result).toBe('This is a very cool test ...');
  });

  it('should generate reply to user', () => {
    const result = generateReplyToUserContent({
      id: 'feedbackId1',
      comment: 'comment',
      createdTime: now,
      lastUpdatedTime: now,
      user: {
        id: 'userId1',
        firstname: 'lorem',
        lastname: 'ipsum',
        email: 'lorem@ipsum.com',
      },
    } as GeneralFeedbackResponse);

    expect(result).toContain('mailto:lorem@ipsum.com');
    expect(result).toContain('feedbackId1');
    expect(result).toContain('Hello lorem');
    expect(result).toContain('comment');
  });
});

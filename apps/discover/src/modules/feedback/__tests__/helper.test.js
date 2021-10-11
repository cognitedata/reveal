import { feedbackHelper } from '../helper';

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
});

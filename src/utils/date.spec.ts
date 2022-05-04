import convertMSToDisplay from './date';

describe('Convert milliseconds to human readable', () => {
  it('should format to readable display', () => {
    expect(convertMSToDisplay(14740000)).toBe('0d 4h 5m 40s');
  });

  it('should format to readable display with days', () => {
    expect(convertMSToDisplay(3236977000)).toBe('37d 11h 9m 37s');
  });

  it('should handle not a number', () => {
    expect(convertMSToDisplay(NaN)).toBe('');
  });
});

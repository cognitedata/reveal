import { getIcon } from 'src/utils/iconUtils';

describe('test icon utils', () => {
  test('when text is not provided should provide default icon', () => {
    expect(getIcon()).toBe('Scan');
  });
  test('when text is person should provide person icon', () => {
    expect(getIcon('person')).toBe('User');
  });
  test('when any other text is provided should provide default icon', () => {
    expect(getIcon('keypoint')).toBe('Scan');
  });
});

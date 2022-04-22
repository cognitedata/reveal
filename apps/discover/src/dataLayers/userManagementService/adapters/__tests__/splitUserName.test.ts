import { splitUserName } from '../splitUserName';

describe('splitUserName', () => {
  it('should return actual name when no parentheses', () => {
    const testName = 'Test name';
    expect(splitUserName(testName)).toMatchObject({
      name: testName,
      subTitle: '',
    });
  });

  it('should return actual name when incomplete pair of parentheses', () => {
    const testName = 'Test name (Cognite';
    expect(splitUserName(testName)).toMatchObject({
      name: testName,
      subTitle: '',
    });
  });

  it('should return splitted result', () => {
    expect(splitUserName('Test name (Cognite)')).toMatchObject({
      name: 'Test name',
      subTitle: 'Cognite',
    });
  });

  it('should return actual name without splitting', () => {
    const testName = 'Test name (Cognite) (Other)';
    expect(splitUserName(testName)).toMatchObject({
      name: testName,
      subTitle: '',
    });
  });
});

import { getSplitUserName } from '../getSplitUserName';

describe('getSplitUserName', () => {
  it('should return actual name when no parentheses', () => {
    const testName = 'Test name';
    expect(getSplitUserName(testName)).toMatchObject({
      name: testName,
      subTitle: '',
    });
  });

  it('should return actual name when incomplete pair of parentheses', () => {
    const testName = 'Test name (Cognite';
    expect(getSplitUserName(testName)).toMatchObject({
      name: testName,
      subTitle: '',
    });
  });

  it('should return splitted result', () => {
    expect(getSplitUserName('Test name (Cognite)')).toMatchObject({
      name: 'Test name',
      subTitle: 'Cognite',
    });
  });

  it('should return actual name without splitting', () => {
    const testName = 'Test name (Cognite) (Other)';
    expect(getSplitUserName(testName)).toMatchObject({
      name: testName,
      subTitle: '',
    });
  });
});

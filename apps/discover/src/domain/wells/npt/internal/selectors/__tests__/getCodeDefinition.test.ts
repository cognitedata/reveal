import { getCodeDefinition } from '../getCodeDefinition';

describe('getCodeDefinition', () => {
  it('should return empty string', () => {
    expect(getCodeDefinition()).toEqual('');
  });

  it('should return expected result', () => {
    const result = getCodeDefinition('id', { id: 'test_value' });
    expect(result).toEqual('test_value');
  });

  it('should return expected empty string', () => {
    const result = getCodeDefinition('id_2', { id: 'test_value' });
    expect(result).toEqual('');
  });
});

import { DASH, getMetadataValueByKey } from '@data-exploration-lib/core';

describe('getMetadataValueByKey', () => {
  const metadata = { Key1: 'value1', key2: 'value2', KEY3: 'value3' };

  it('should return dash value with empty metadata', () => {
    const result = getMetadataValueByKey('key1');
    expect(result).toEqual(DASH);
  });

  it('should return dash value', () => {
    const result = getMetadataValueByKey('key4', metadata);
    expect(result).toEqual(DASH);
  });

  it('should return value of key1', () => {
    const result = getMetadataValueByKey('key1', metadata);
    expect(result).toEqual(metadata['Key1']);
  });

  it('should return value as expected', () => {
    const result = getMetadataValueByKey('KEY1', metadata);
    expect(result).toEqual(metadata['Key1']);
  });

  it('should return value of key3', () => {
    const result = getMetadataValueByKey('key3', metadata);
    expect(result).toEqual(metadata['KEY3']);
  });
});

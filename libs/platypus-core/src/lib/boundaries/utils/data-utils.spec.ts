import { DataUtils } from './data-utils';

describe('DataUtilsTest', () => {
  it('should check if data is string', async () => {
    expect(DataUtils.isString('test')).toBe(true);
    expect(DataUtils.isString(1)).toBe(false);
    expect(DataUtils.isString([])).toBe(false);
    expect(DataUtils.isString({})).toBe(false);
  });

  it('should check if data is array', async () => {
    expect(DataUtils.isArray('test')).toBe(false);
    expect(DataUtils.isArray(1)).toBe(false);
    expect(DataUtils.isArray([])).toBe(true);
    expect(DataUtils.isArray({})).toBe(false);
  });
  it('should check if data is number', async () => {
    expect(DataUtils.isNumber('test')).toBe(false);
    expect(DataUtils.isNumber(1)).toBe(true);
  });
});

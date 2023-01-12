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

  describe('convertToExternalId', () => {
    it('works with string with hyphens', () => {
      expect(DataUtils.convertToExternalId('my-data-model')).toBe(
        'my_data_model'
      );
    });

    it('works with string with spaces', () => {
      expect(DataUtils.convertToExternalId('My Data Model')).toBe(
        'My_Data_Model'
      );
    });

    it('works with snake cased string', () => {
      expect(DataUtils.convertToExternalId('my_data_model')).toBe(
        'my_data_model'
      );
    });

    it('works with kebab-cased string', () => {
      expect(DataUtils.convertToExternalId('my-data-model')).toBe(
        'my_data_model'
      );
    });

    it('works with camel case string', () => {
      expect(DataUtils.convertToExternalId('myDataModel')).toBe('myDataModel');
    });

    it('works with pascal case string', () => {
      expect(DataUtils.convertToExternalId('MyDataModel')).toBe('MyDataModel');
    });

    it('works with all caps string with spaces', () => {
      expect(DataUtils.convertToExternalId('MY DATA MODEL')).toBe(
        'MY_DATA_MODEL'
      );
    });

    it('works when input starts with number', () => {
      expect(DataUtils.convertToExternalId('4-data-model')).toBe('data_model');
    });

    it('works when input starts with invalid character', () => {
      expect(DataUtils.convertToExternalId('*-data-model')).toBe('data_model');
    });

    it('works when input ends with invalid character', () => {
      expect(DataUtils.convertToExternalId('data_model-')).toBe('data_model');
    });

    it('works when input has invalid character(s) in middle', () => {
      expect(DataUtils.convertToExternalId('dat#a_mo$del')).toBe('data_model');
    });

    it('works when input starts with underscore', () => {
      expect(DataUtils.convertToExternalId('_data_model')).toBe('data_model');
    });

    it('works when input starts with space', () => {
      expect(DataUtils.convertToExternalId(' data-model')).toBe('data_model');
    });
  });
});

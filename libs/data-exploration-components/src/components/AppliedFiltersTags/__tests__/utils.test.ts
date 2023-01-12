import '@testing-library/jest-dom/extend-expect';
import {
  NIL_FILTER_LABEL,
  NIL_FILTER_VALUE,
} from '@data-exploration-lib/domain-layer';
import { CUSTOM_FILTER_TITLE } from '../constants';
import { formatValue, getTitle } from '../utils';

describe('utils', () => {
  describe('getTitle', () => {
    it('should return pre-defined filter title', () => {
      const input = 'assetSubtreeIds';
      expect(getTitle(input)).toEqual(CUSTOM_FILTER_TITLE[input]);
    });

    it('should return input string as expected', () => {
      const input = 'test input';
      expect(getTitle(input)).toEqual('Test Input');
    });
  });

  describe('formatValue', () => {
    it('should return empty string', () => {
      expect(formatValue()).toEqual('');
    });

    it('should return boolean value as a string', () => {
      expect(formatValue(true)).toEqual('True');
      expect(formatValue(false)).toEqual('False');
    });

    it('should return string filter value correctly', () => {
      expect(formatValue(NIL_FILTER_VALUE)).toEqual(NIL_FILTER_LABEL);
      expect(formatValue('test-input')).toEqual('test-input');
    });

    it('should return number as a string', () => {
      expect(formatValue(1)).toEqual('1');
    });

    it('should handle date filter values properly', () => {
      expect(formatValue({ min: 10, max: 20 })).toMatch(/-/);
      expect(formatValue({ min: 10 })).toMatch(/After/);
      expect(formatValue({ max: 10 })).toMatch(/Before/);
    });

    it('should show key value pairs properly', () => {
      expect(formatValue({ key: 'key', value: 'value' })).toEqual('key=value');
    });

    it('should show label value filters properly', () => {
      expect(formatValue({ label: 'label', value: 'value' })).toEqual('label');
      expect(formatValue({ value: 'value' })).toEqual('value');
      expect(formatValue({ value: 10 })).toEqual('10');
    });

    it('should show multiple key value pairs properly', () => {
      expect(
        formatValue({
          key1: 'value1',
          key2: 'value2',
        })
      ).toEqual('key1=value1, key2=value2');
    });
  });
});

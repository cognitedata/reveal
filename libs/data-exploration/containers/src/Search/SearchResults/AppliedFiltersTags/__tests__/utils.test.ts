import '@testing-library/jest-dom/extend-expect';
import { mockTFunction } from '@data-exploration-lib/core';
import {
  NIL_FILTER_LABEL,
  NIL_FILTER_VALUE,
} from '@data-exploration-lib/domain-layer';

import { CUSTOM_FILTER_TITLE } from '../constants';
import { formatValue, getTitle } from '../utils';

jest.mock('@cognite/unified-file-viewer', () => {
  return {
    isSupportedFileInfo: jest.fn(() => true),
  };
});

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
      expect(formatValue(undefined, mockTFunction)).toEqual('');
    });

    it('should return boolean value as a string', () => {
      expect(formatValue(true, mockTFunction)).toEqual('True');
      expect(formatValue(false, mockTFunction)).toEqual('False');
    });

    it('should return string filter value correctly', () => {
      expect(formatValue(NIL_FILTER_VALUE, mockTFunction)).toEqual(
        NIL_FILTER_LABEL
      );
      expect(formatValue('test-input', mockTFunction)).toEqual('test-input');
    });

    it('should return number as a string', () => {
      expect(formatValue(1, mockTFunction)).toEqual('1');
    });

    it('should handle date filter values properly', () => {
      expect(formatValue({ min: 10, max: 20 }, mockTFunction)).toMatch(/-/);
      expect(formatValue({ min: 10 }, mockTFunction)).toMatch(/After/);
      expect(formatValue({ max: 10 }, mockTFunction)).toMatch(/Before/);
    });

    it('should show key value pairs properly', () => {
      expect(
        formatValue({ key: 'key', value: 'value' }, mockTFunction)
      ).toEqual('key=value');
    });

    it('should show label value filters properly', () => {
      expect(
        formatValue({ label: 'label', value: 'value' }, mockTFunction)
      ).toEqual('label');
      expect(formatValue({ value: 'value' }, mockTFunction)).toEqual('value');
      expect(formatValue({ value: 10 }, mockTFunction)).toEqual('10');
    });

    it('should show multiple key value pairs properly', () => {
      expect(
        formatValue(
          {
            key1: 'value1',
            key2: 'value2',
          },
          mockTFunction
        )
      ).toEqual('key1=value1, key2=value2');
    });
  });
});

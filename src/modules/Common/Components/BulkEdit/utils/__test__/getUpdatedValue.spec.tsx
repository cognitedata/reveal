import React from 'react';
import { CellContainer } from 'src/modules/Common/Components/BulkEdit/Source/getDataForSource';
import { getUpdatedValue } from 'src/modules/Common/Components/BulkEdit/utils/getUpdatedValue';

describe('Test updated value', () => {
  describe('If original originalValue not set', () => {
    const originalValue = undefined;

    test('If updated value undefined return --- cell', () => {
      const newValue = undefined;
      const expectedValue = <CellContainer>---</CellContainer>;
      expect(getUpdatedValue({ originalValue, newValue })).toStrictEqual(
        expectedValue
      );
    });

    test("If updated value '' return return --- cell", () => {
      const newValue = '';
      const expectedValue = <CellContainer>---</CellContainer>;
      expect(getUpdatedValue({ originalValue, newValue })).toStrictEqual(
        expectedValue
      );
    });

    test('If updated value defined return return updated value cell', () => {
      const newValue = 'Updated Source';
      const expectedValue = <CellContainer>{newValue}</CellContainer>;
      expect(getUpdatedValue({ originalValue, newValue })).toStrictEqual(
        expectedValue
      );
    });
  });
  describe('If original originalValue set', () => {
    const originalValue = 'Original Source';

    test('If updated value undefined return originalValue cell', () => {
      const newValue = undefined;
      const expectedValue = <CellContainer>{originalValue}</CellContainer>;
      expect(getUpdatedValue({ originalValue, newValue })).toStrictEqual(
        expectedValue
      );
    });

    test("If updated value '' return return --- cell", () => {
      const newValue = '';
      const expectedValue = <CellContainer>---</CellContainer>;
      expect(getUpdatedValue({ originalValue, newValue })).toStrictEqual(
        expectedValue
      );
    });

    test('If updated value defined return return updated value cell', () => {
      const newValue = 'Updated Source';
      const expectedValue = <CellContainer>{newValue}</CellContainer>;
      expect(getUpdatedValue({ originalValue, newValue })).toStrictEqual(
        expectedValue
      );
    });
  });
});

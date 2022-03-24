import React from 'react';
import {
  CellContainer,
  getOriginalValue,
  getUpdatedValue,
} from 'src/modules/Common/Components/BulkEdit/Source/getDataForSource';

describe('Test getDataForSource', () => {
  describe('Test original value', () => {
    test('If source undefined return --- cell', () => {
      const source = undefined;
      const expectedValue = <CellContainer>---</CellContainer>;
      expect(getOriginalValue({ source })).toStrictEqual(expectedValue);
    });

    test('If source defined return source cell', () => {
      const source = 'Original Source';
      const expectedValue = <CellContainer>{source}</CellContainer>;
      expect(getOriginalValue({ source })).toStrictEqual(expectedValue);
    });
  });

  describe('Test updated value', () => {
    describe('If original source not set', () => {
      const source = undefined;

      test('If updated value undefined return --- cell', () => {
        const newSource = undefined;
        const expectedValue = <CellContainer>---</CellContainer>;
        expect(getUpdatedValue({ source, newSource })).toStrictEqual(
          expectedValue
        );
      });

      test("If updated value '' return return --- cell", () => {
        const newSource = '';
        const expectedValue = <CellContainer>---</CellContainer>;
        expect(getUpdatedValue({ source, newSource })).toStrictEqual(
          expectedValue
        );
      });

      test('If updated value defined return return updated value cell', () => {
        const newSource = 'Updated Source';
        const expectedValue = <CellContainer>{newSource}</CellContainer>;
        expect(getUpdatedValue({ source, newSource })).toStrictEqual(
          expectedValue
        );
      });
    });
    describe('If original source set', () => {
      const source = 'Original Source';

      test('If updated value undefined return source cell', () => {
        const newSource = undefined;
        const expectedValue = <CellContainer>{source}</CellContainer>;
        expect(getUpdatedValue({ source, newSource })).toStrictEqual(
          expectedValue
        );
      });

      test("If updated value '' return return --- cell", () => {
        const newSource = '';
        const expectedValue = <CellContainer>---</CellContainer>;
        expect(getUpdatedValue({ source, newSource })).toStrictEqual(
          expectedValue
        );
      });

      test('If updated value defined return return updated value cell', () => {
        const newSource = 'Updated Source';
        const expectedValue = <CellContainer>{newSource}</CellContainer>;
        expect(getUpdatedValue({ source, newSource })).toStrictEqual(
          expectedValue
        );
      });
    });
  });
});

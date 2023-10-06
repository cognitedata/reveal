import React from 'react';

import { CellContainer } from '../CellContainer';
import { getOriginalValue } from '../getOriginalValue';

describe('Test original value', () => {
  test('If originalValue undefined return --- cell', () => {
    const expectedValue = <CellContainer>---</CellContainer>;
    expect(getOriginalValue({ originalValue: '' })).toStrictEqual(
      expectedValue
    );
    expect(getOriginalValue({ originalValue: undefined })).toStrictEqual(
      expectedValue
    );
  });

  test('If originalValue defined return originalValue cell', () => {
    const originalValue = 'Original Source';
    const expectedValue = <CellContainer>{originalValue}</CellContainer>;
    expect(getOriginalValue({ originalValue })).toStrictEqual(expectedValue);
  });
});

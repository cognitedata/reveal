import React from 'react';
import { uppercaseFirstWord } from '../../utils/primitivesUtils';

interface MetaFieldProps {
  fieldKey: string;
  fieldValue: string;
  testId: string;
}

export const MetaField = ({ fieldKey, fieldValue, testId }: MetaFieldProps) => {
  return (
    <>
      <label htmlFor={fieldKey} data-testid={testId}>
        {uppercaseFirstWord(fieldKey)}
      </label>
      <span id={fieldKey}>{fieldValue}</span>
    </>
  );
};

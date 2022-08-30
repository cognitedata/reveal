import React from 'react';
import { DivFlex, StyledLabel } from 'components/styled';
import { isUrl, uppercaseFirstWord } from 'utils/primitivesUtils';

interface MetaFieldProps {
  fieldKey: string;
  fieldValue: string;
  testId: string;
}

export const MetaField = ({ fieldKey, fieldValue, testId }: MetaFieldProps) => {
  function renderValue(value: string) {
    if (isUrl(value)) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    }
    return value;
  }

  return (
    <DivFlex direction="column" align="flex-start">
      <StyledLabel htmlFor={fieldKey} data-testid={testId}>
        {uppercaseFirstWord(fieldKey)}
      </StyledLabel>
      <div
        css="line-height: 1.5rem; word-wrap: break-word; max-width: 100%"
        id={fieldKey}
      >
        {renderValue(fieldValue)}
      </div>
    </DivFlex>
  );
};

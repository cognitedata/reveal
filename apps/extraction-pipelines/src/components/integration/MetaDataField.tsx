import React from 'react';
import { StyledLabel } from 'styles/StyledForm';
import { DivFlex } from 'styles/flex/StyledFlex';
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
    return <span id={fieldKey}>{value}</span>;
  }

  return (
    <DivFlex direction="column" align="flex-start" className="meta-field">
      <StyledLabel htmlFor={fieldKey} data-testid={testId}>
        {uppercaseFirstWord(fieldKey)}
      </StyledLabel>
      {renderValue(fieldValue)}
    </DivFlex>
  );
};

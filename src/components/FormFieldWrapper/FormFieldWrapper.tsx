import React, { ReactNode } from 'react';

import { Body, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

type FormFieldWrapperProps = {
  children: ReactNode;
  isRequired?: boolean;
  title?: string;
};

const FormFieldWrapper = ({
  children,
  isRequired,
  title,
}: FormFieldWrapperProps): JSX.Element => {
  return (
    <StyledFormFieldWrapper>
      <StyledFormFieldTitle level={2} strong>
        {title}
        {isRequired && (
          <StyledFormFieldRequired>&nbsp;*</StyledFormFieldRequired>
        )}
      </StyledFormFieldTitle>
      {children}
    </StyledFormFieldWrapper>
  );
};

const StyledFormFieldWrapper = styled.div`
  :not(:last-child) {
    margin-bottom: 16px;
  }
`;

const StyledFormFieldTitle = styled(Body)`
  color: ${Colors['text-primary'].hex()};
  display: flex;
  margin-bottom: 6px;
`;

const StyledFormFieldRequired = styled.div`
  color: ${Colors['red-3'].hex()};
`;

export default FormFieldWrapper;

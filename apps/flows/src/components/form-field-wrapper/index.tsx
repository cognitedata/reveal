import { ReactNode } from 'react';

import styled from 'styled-components';

import { Body, Colors, Detail, Flex, Icon, Tooltip } from '@cognite/cogs.js';

export type FormFieldWrapperProps = {
  children: ReactNode;
  error?: string;
  isRequired?: boolean;
  title?: string;
  infoTooltip?: JSX.Element;
};

const FormFieldWrapper = ({
  children,
  error,
  isRequired,
  title,
  infoTooltip,
}: FormFieldWrapperProps): JSX.Element => {
  return (
    <Flex direction="column">
      {title && (
        <StyledFormFieldTitle level={2} strong>
          {title}
          {isRequired && <StyledFormFieldRequired>*</StyledFormFieldRequired>}
          {infoTooltip && (
            <Tooltip
              interactive
              sticky
              wrapped
              position="bottom"
              content={infoTooltip}
            >
              <StyledIcon type="InfoFilled" size={12} />
            </Tooltip>
          )}
        </StyledFormFieldTitle>
      )}
      {children}
      {error && (
        <StyledFormFieldError>
          <Icon size={12} type="ErrorFilled" />
          {error}
        </StyledFormFieldError>
      )}
    </Flex>
  );
};

const StyledFormFieldTitle = styled(Body)`
  color: ${Colors['text-icon--strong']};
  display: flex;
  margin-bottom: 6px;
  gap: 2px;
`;

const StyledFormFieldError = styled(Detail)`
  align-items: center;
  color: ${Colors['text-icon--status-critical']};
  display: flex;
  gap: 4px;
  margin-top: 4px;
`;

const StyledFormFieldRequired = styled.div`
  color: ${Colors['text-icon--status-critical']};
`;

const StyledIcon = styled(Icon)`
  color: ${Colors['text-icon--muted']};
  transform: translateY(2px);
`;

export default FormFieldWrapper;

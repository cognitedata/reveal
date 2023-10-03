import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Body, Flex, Icon } from '@cognite/cogs.js';

type RequiredWrapperProps = {
  errorMessage?: string;
  label: string;
  showErrorMessage: boolean;
} & PropsWithChildren;

/** Wraps a component with a required label and an error message.
 * Can be used for the Select component and removed when cogs supports required and errors states. */
export const RequiredWrapper = ({
  children,
  errorMessage,
  label,
  showErrorMessage,
}: RequiredWrapperProps) => {
  return (
    <StyledFlex direction="column" gap={5}>
      <Flex alignContent="center" direction="row" gap={4}>
        <Body size="medium" strong>
          {label}
        </Body>
        <Body size="medium" className="critical-colored">
          *
        </Body>
      </Flex>

      {children}

      {showErrorMessage && (
        <Flex
          alignContent="center"
          direction="row"
          gap={5}
          className="critical-colored"
        >
          <Icon type="ErrorFilled" />
          <Body size="x-small" className="critical-colored">
            {errorMessage}
          </Body>
        </Flex>
      )}
    </StyledFlex>
  );
};

const StyledFlex = styled(Flex)`
  .critical-colored {
    color: var(--cogs-text-icon--status-critical);
  }
`;

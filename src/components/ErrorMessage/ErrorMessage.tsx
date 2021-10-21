import React, { FunctionComponent, PropsWithChildren } from 'react';
import { generateStatusMessage } from 'utils/errorUtils';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const ErrorWrapper = styled.div`
  padding: 2rem;
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  margin-right: 1rem;
  color: ${Colors.warning.hex()};
`;

export interface DataSetError {
  status: number;
  message: string;
  missing?: { id: number }[];
}

interface ErrorMessageProps {
  error?: DataSetError;
}

export const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({
  error,
}: PropsWithChildren<ErrorMessageProps>) => {
  if (!error) {
    return null;
  }
  return (
    <ErrorWrapper className="z-4">
      <StyledIcon type="Warning" />
      {generateStatusMessage(error)}
    </ErrorWrapper>
  );
};

import React from 'react';
import styled from 'styled-components';

import { ProfileResultType } from 'hooks/profiling-service';
import Message from 'components/Message/Message';

type ProfileStatusMessageProps = {
  resultType: ProfileResultType;
  isCompact?: boolean;
};

export const ProfileStatusMessage = ({
  resultType,
  isCompact,
}: ProfileStatusMessageProps): JSX.Element => {
  switch (resultType) {
    case 'complete':
      return (
        <StyledMessage
          isClosable
          isCompact={isCompact}
          message="Data profiling completed for all rows and columns."
          type="success"
        />
      );
    case 'running':
      return (
        <StyledMessage
          isCompact={isCompact}
          message="Running data profiling for the first million rows. Profile is currently being populated."
          type="loading"
        />
      );
    case 'partial':
      return (
        <StyledMessage
          isClosable
          isCompact={isCompact}
          message="Data profiling partially completed. Only up to one million rows of data are used for profiling."
          type="warning"
        />
      );
    default:
      return <></>;
  }
};

const StyledMessage = styled(Message)<{ isCompact?: boolean }>`
  align-items: ${({ isCompact }) => (isCompact ? 'flex-start' : 'center')};
  margin-bottom: ${({ isCompact }) => (isCompact ? '0' : '20px')};
  padding: 16px 24px;
  & > * {
    margin: ${({ isCompact }) => isCompact && '0 6px'};
  }
`;

import React from 'react';
import styled from 'styled-components';

import { ProfileResultType } from 'hooks/profiling-service';
import Message from 'components/Message/Message';

type ProfileStatusMessageProps = {
  resultType: ProfileResultType;
};

export const ProfileStatusMessage = ({
  resultType,
}: ProfileStatusMessageProps): JSX.Element => {
  switch (resultType) {
    case 'complete':
      return (
        <StyledMessage
          isClosable
          message="Data profiling completed for all rows and columns."
          type="success"
        />
      );
    case 'running':
      return (
        <StyledMessage
          message="Running data profiling for the first million rows. Profile is currently being populated."
          type="loading"
        />
      );
    case 'partial':
      return (
        <StyledMessage
          isClosable
          message="Data profiling partially completed. Only the first million rows of data were processed."
          type="warning"
        />
      );
    default:
      return <></>;
  }
};

const StyledMessage = styled(Message)`
  margin-bottom: 20px;
`;

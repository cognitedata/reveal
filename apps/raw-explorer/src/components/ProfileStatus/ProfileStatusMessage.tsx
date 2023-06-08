import React from 'react';
import styled from 'styled-components';

import { ProfileResultType } from 'hooks/profiling-service';
import Message from 'components/Message/Message';
import { useTranslation } from 'common/i18n';

type ProfileStatusMessageProps = {
  resultType: ProfileResultType;
  isCompact?: boolean;
};

export const ProfileStatusMessage = ({
  resultType,
  isCompact,
}: ProfileStatusMessageProps): JSX.Element => {
  const { t } = useTranslation();
  switch (resultType) {
    case 'complete':
      return (
        <StyledMessage
          isClosable
          isCompact={isCompact}
          message={t('profile-status-message_complete')}
          type="success"
        />
      );
    case 'running':
      return (
        <StyledMessage
          isCompact={isCompact}
          message={t('profile-status-message_running')}
          type="loading"
        />
      );
    case 'partial':
      return (
        <StyledMessage
          isClosable
          isCompact={isCompact}
          message={t('profile-status-message_partial')}
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

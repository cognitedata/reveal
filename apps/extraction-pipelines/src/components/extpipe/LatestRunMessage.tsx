import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { RunStatusUI } from 'model/Status';
import { FailedRunMessageIcon } from 'components/icons/FailedRunMessageIcon';
import { Button, Colors } from '@cognite/cogs.js';
import MessageDialog from 'components/buttons/MessageDialog';
import StatusMarker from 'components/extpipes/cols/StatusMarker';
import styled from 'styled-components';
import { useTranslation } from 'common';
interface LatestRunMessageProps {
  status: RunStatusUI;
  message?: string;
}

export const LatestRunMessage: FunctionComponent<LatestRunMessageProps> = ({
  status,
  message,
}: PropsWithChildren<LatestRunMessageProps>) => {
  const { t } = useTranslation();
  const [showError, setShowError] = useState(false);

  if (status !== RunStatusUI.FAILURE) {
    return <StatusMarker status={status} />;
  }

  const onClick = () => {
    setShowError(false);
  };
  const toggleError = () => {
    setShowError((prev) => !prev);
  };

  return (
    <>
      <MessageDialog
        visible={showError}
        title={t('latest-run-err-title')}
        contentText={message ?? t('latest-run-err-message-not-set')}
        handleClose={onClick}
        icon={<FailedRunMessageIcon />}
      >
        <StyledButton
          type="ghost"
          aria-label={t('latest-run-view-err-message')}
          onClick={toggleError}
        >
          <StatusMarker status={status} />
          <FailedRunMessageIcon />
        </StyledButton>
      </MessageDialog>
    </>
  );
};

const StyledButton = styled(Button)`
  &.cogs-btn-secondary {
    background-color: transparent;
    :hover {
      background-color: transparent;
    }
  }
  .cogs-badge {
    &.badge-fail {
      span {
        background-color: ${Colors.danger.hex()};
      }
    }
  }
`;

import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { RunStatusUI } from 'model/Status';
import { FailedRunMessageIcon } from 'components/icons/FailedRunMessageIcon';
import { Button, Colors } from '@cognite/cogs.js';
import { NO_ERROR_MESSAGE } from 'components/form/viewEditIntegration/FailMessageModal';
import MessageDialog from 'components/buttons/MessageDialog';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import styled from 'styled-components';

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
interface LatestRunMessageProps {
  status: RunStatusUI;
  message?: string;
}

export const LatestRunMessage: FunctionComponent<LatestRunMessageProps> = ({
  status,
  message,
}: PropsWithChildren<LatestRunMessageProps>) => {
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
        title="Latest run error message"
        contentText={message ?? NO_ERROR_MESSAGE}
        handleClose={onClick}
        icon={<FailedRunMessageIcon />}
      >
        <StyledButton
          type="ghost"
          aria-label="Click to view error message"
          onClick={toggleError}
        >
          <StatusMarker status={status} />
          <FailedRunMessageIcon />
        </StyledButton>
      </MessageDialog>
    </>
  );
};

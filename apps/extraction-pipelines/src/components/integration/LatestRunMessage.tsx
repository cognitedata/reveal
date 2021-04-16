import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import { Status } from 'model/Status';
import { FailedRunMessageIcon } from 'components/icons/FailedRunMessageIcon';
import { Button } from '@cognite/cogs.js';
import { NO_ERROR_MESSAGE } from 'components/form/viewEditIntegration/FailMessageModal';
import MessageDialog from 'components/buttons/MessageDialog';
import StatusMarker from 'components/integrations/cols/StatusMarker';

interface LatestRunMessageProps {
  status: Status;
  message?: string;
}

export const LatestRunMessage: FunctionComponent<LatestRunMessageProps> = ({
  status,
  message,
}: PropsWithChildren<LatestRunMessageProps>) => {
  const [showError, setShowError] = useState(false);
  if (status !== Status.FAIL) {
    return <StatusMarker status={status} />;
  }

  function onClick() {
    setShowError(false);
  }
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
        <Button
          type="ghost"
          aria-label="Click to view error message"
          onClick={toggleError}
        >
          <StatusMarker status={status} />
          <FailedRunMessageIcon />
        </Button>
      </MessageDialog>
    </>
  );
};

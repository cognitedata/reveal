import React from 'react';
import { RunStatusUI } from 'model/Status';
import { FailedRunMessageIcon } from 'components/icons/FailedRunMessageIcon';

interface OwnProps {
  status: RunStatusUI;
}

const MessageIcon = ({ status }: OwnProps) => {
  switch (status) {
    case RunStatusUI.FAILURE:
      return <FailedRunMessageIcon />;
    default:
      return <></>;
  }
};

export default MessageIcon;

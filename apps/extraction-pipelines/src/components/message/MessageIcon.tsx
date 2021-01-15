import React from 'react';
import { Status } from '../../model/Status';
import { FailedRunMessageIcon } from '../icons/FailedRunMessageIcon';

interface OwnProps {
  status: Status;
}

const MessageIcon = ({ status }: OwnProps) => {
  switch (status) {
    case Status.FAIL:
      return <FailedRunMessageIcon />;
    default:
      return <></>;
  }
};

export default MessageIcon;

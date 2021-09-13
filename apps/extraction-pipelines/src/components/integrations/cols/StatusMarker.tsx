import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Badge, Label } from '@cognite/cogs.js';
import { StyledTooltip } from 'styles/StyledToolTip';
import { RunStatusUI } from 'model/Status';

interface OwnProps {
  id?: string;
  status: RunStatusUI | null;
  dataTestId?: string;
}

type Props = OwnProps;

const StatusMarker: FunctionComponent<Props> = ({
  status,
  dataTestId = '',
  ...rest
}: PropsWithoutRef<Props>) => {
  switch (status) {
    case RunStatusUI.SUCCESS:
      return (
        <Label size={'medium'} variant={'success'}>
          Success
        </Label>
      );
    case RunStatusUI.FAILURE:
      return (
        <Label size={'medium'} variant={'danger'}>
          Failure
        </Label>
      );
    case RunStatusUI.SEEN:
      return (
        <Label size={'medium'} variant={'default'}>
          Seen
        </Label>
      );
    case RunStatusUI.NOT_ACTIVATED:
      return (
        <Label size={'medium'} variant={'unknown'}>
          Not activated
        </Label>
      );
    default:
      return <></>;
  }
};

export default StatusMarker;

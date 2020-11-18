import React, { FunctionComponent } from 'react';
import { TimeDisplay } from '../../TimeDisplay/TimeDisplay';

interface OwnProps {
  lastSeen: number | undefined;
}

type Props = OwnProps;

const LastSeen: FunctionComponent<Props> = ({ lastSeen }: Props) => {
  return (
    <>{!!lastSeen && <TimeDisplay value={lastSeen} relative withTooltip />}</>
  );
};

export default LastSeen;

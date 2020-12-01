import React, { FunctionComponent } from 'react';
import { TimeDisplay } from '../../TimeDisplay/TimeDisplay';

interface OwnProps {
  time: number; // milliseconds
}

type Props = OwnProps;

const RelativeTimeWithTooltip: FunctionComponent<Props> = ({ time }: Props) => {
  return <>{time > 0 && <TimeDisplay value={time} relative withTooltip />}</>;
};

export default RelativeTimeWithTooltip;

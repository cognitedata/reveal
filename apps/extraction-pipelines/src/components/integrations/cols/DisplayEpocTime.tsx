import React, { FunctionComponent } from 'react';
import { TimeDisplay } from '../../TimeDisplay/TimeDisplay';

interface OwnProps {
  time: number | undefined;
}

type Props = OwnProps;

const DisplayEpocTime: FunctionComponent<Props> = ({ time }: Props) => {
  return (
    <>{!!time && <TimeDisplay value={time} relative withTooltip isEpoc />}</>
  );
};

export default DisplayEpocTime;

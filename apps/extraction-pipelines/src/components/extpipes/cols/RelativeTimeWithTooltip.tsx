import React, { FunctionComponent } from 'react';
import { TimeDisplay } from '../../TimeDisplay/TimeDisplay';

interface OwnProps {
  id: string;
  time: number; // milliseconds
}

type Props = OwnProps;

const RelativeTimeWithTooltip: FunctionComponent<Props> = ({
  time,
  ...rest
}: Props) => {
  return (
    <>
      {time > 0 && <TimeDisplay value={time} relative withTooltip {...rest} />}
    </>
  );
};

export default RelativeTimeWithTooltip;

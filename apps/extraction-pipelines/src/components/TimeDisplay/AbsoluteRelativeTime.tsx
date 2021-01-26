import React, { FunctionComponent } from 'react';
import { TimeDisplay, TimeDisplayProps } from './TimeDisplay';

type AbsoluteRelativeTimeProps = Pick<TimeDisplayProps, 'value'> &
  React.HTMLAttributes<HTMLSpanElement>;

export const AbsoluteRelativeTime: FunctionComponent<AbsoluteRelativeTimeProps> = ({
  value,
  ...rest
}: AbsoluteRelativeTimeProps) => {
  return (
    <span {...rest}>
      <TimeDisplay value={value} /> (
      <TimeDisplay value={value} relative />)
    </span>
  );
};

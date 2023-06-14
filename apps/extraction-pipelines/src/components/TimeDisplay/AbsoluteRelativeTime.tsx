import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { TimeDisplay, TimeDisplayProps } from './TimeDisplay';

interface AbsoluteRelativeTimeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    Pick<TimeDisplayProps, 'value'> {
  noValueMessage?: string;
}
export const AbsoluteRelativeTime: FunctionComponent<
  AbsoluteRelativeTimeProps
> = ({
  value,
  noValueMessage = '',
  ...rest
}: PropsWithoutRef<AbsoluteRelativeTimeProps>) => {
  if (!value) {
    return noValueMessage ? <i>{noValueMessage}</i> : <></>;
  }
  return (
    <span {...rest}>
      <TimeDisplay value={value} /> (
      <TimeDisplay value={value} relative />)
    </span>
  );
};

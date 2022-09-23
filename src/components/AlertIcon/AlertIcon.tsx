/**
 * Alert Icon
 *
 * Birth place: https://cognitedata.atlassian.net/browse/CHART-1375
 */

import { Label } from '@cognite/cogs.js';
import { ComponentProps, MouseEventHandler } from 'react';

type Props = ComponentProps<typeof Label> & {
  value?: string;
  onDoubleClick?: MouseEventHandler<HTMLSpanElement>;
};

const AlertIcon = ({ value, ...rest }: Props) => {
  return (
    <Label size="medium" {...rest}>
      {value}
    </Label>
  );
};

export default AlertIcon;

/**
 * Alert Icon
 *
 * Birth place: https://cognitedata.atlassian.net/browse/CHART-1375
 */

import { ComponentProps, MouseEventHandler } from 'react';

import { Chip } from '@cognite/cogs.js';

type Props = ComponentProps<typeof Chip> & {
  value?: string;
  onDoubleClick?: MouseEventHandler<HTMLSpanElement>;
};

const AlertIcon = ({ value = '', ...rest }: Props) => {
  return <Chip size="medium" {...rest} label={value} />;
};

export default AlertIcon;

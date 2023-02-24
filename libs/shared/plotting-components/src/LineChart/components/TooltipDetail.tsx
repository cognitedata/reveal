import * as React from 'react';

import { Datum } from 'plotly.js';

import {
  TooltipDetailLabel,
  TooltipDetailValue,
  TooltipDetailWrapper,
} from '../elements';

export interface TooltipDetailProps {
  label: string;
  value?: Datum;
  backgroundColor: string;
}

export const TooltipDetail: React.FC<TooltipDetailProps> = ({
  label,
  value = 'N/A',
  backgroundColor,
}) => {
  return (
    <TooltipDetailWrapper style={{ backgroundColor }}>
      <TooltipDetailLabel>{label}: </TooltipDetailLabel>
      <TooltipDetailValue>{String(value)}</TooltipDetailValue>
    </TooltipDetailWrapper>
  );
};

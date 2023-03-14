import * as React from 'react';

import { DEFAULT_BACKGROUND_COLOR } from '../../constants';
import { ValueType } from '../../types';

import {
  TooltipDetailLabel,
  TooltipDetailValue,
  TooltipDetailWrapper,
} from './elements';

export interface TooltipDetailProps {
  label: string;
  value?: ValueType;
  backgroundColor?: string;
  textColor?: string;
}

export const TooltipDetail: React.FC<TooltipDetailProps> = ({
  label,
  value = 'N/A',
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  textColor,
}) => {
  return (
    <TooltipDetailWrapper style={{ backgroundColor, color: textColor }}>
      <TooltipDetailLabel>{label}: </TooltipDetailLabel>
      <TooltipDetailValue>{String(value)}</TooltipDetailValue>
    </TooltipDetailWrapper>
  );
};

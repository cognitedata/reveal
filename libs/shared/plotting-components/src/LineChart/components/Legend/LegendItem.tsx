import * as React from 'react';

import { LegendItemWrapper, LegendItemLabel, LegendItemIcon } from './elements';

export interface LegendItemProps {
  color: string;
  label: string;
}

export const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => {
  return (
    <LegendItemWrapper>
      <LegendItemIcon style={{ backgroundColor: color }} />
      <LegendItemLabel>{label}</LegendItemLabel>
    </LegendItemWrapper>
  );
};

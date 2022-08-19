import * as React from 'react';

import { MUD_LINE_COLOR, RKB_COLOR, SEA_LEVEL_COLOR } from '../../constants';

import { HeaderText, LegendIndicator, LegendWrapper } from './elements';

const LEGEND_CONFIG: LegendItemProps[] = [
  {
    label: 'RKB',
    color: RKB_COLOR,
  },
  {
    label: 'Sea Level',
    color: SEA_LEVEL_COLOR,
  },
  {
    label: 'Mud Line',
    color: MUD_LINE_COLOR,
  },
];

interface LegendItemProps {
  label: string;
  color: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ label, color }) => {
  return (
    <HeaderText>
      <LegendIndicator color={color} />
      {label}
    </HeaderText>
  );
};

export const Legend: React.FC = () => {
  return (
    <LegendWrapper>
      {LEGEND_CONFIG.map((legendItem) => (
        <LegendItem key={legendItem.label} {...legendItem} />
      ))}
    </LegendWrapper>
  );
};

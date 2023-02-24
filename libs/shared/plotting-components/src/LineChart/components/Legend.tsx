import * as React from 'react';
import { DEFAULT_LINE_COLOR } from '../constants';
import { LegendWrapper } from '../elements';
import { Data } from '../types';
import { getLineName } from '../utils/getLineName';
import { LegendItem } from './LegendItem';

export interface LegendProps {
  data: Data[];
  showLegend: boolean;
  marginLeft?: number;
}

export const Legend: React.FC<LegendProps> = ({ data, showLegend }) => {
  if (!showLegend) {
    return null;
  }

  return (
    <LegendWrapper>
      {data.map(({ color = DEFAULT_LINE_COLOR, name }, index) => {
        return <LegendItem color={color} label={getLineName(name, index)} />;
      })}
    </LegendWrapper>
  );
};

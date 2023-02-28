import * as React from 'react';

import { DEFAULT_LINE_COLOR } from '../../constants';
import { Data, HorizontalPlacement } from '../../types';
import { getDataAsArray } from '../../utils/getDataAsArray';
import { getLineName } from '../../utils/getLineName';

import { LegendWrapper } from './elements';
import { LegendItem } from './LegendItem';

export interface LegendProps {
  data: Data | Data[];
  showLegend: boolean;
  legendPlacement?: HorizontalPlacement;
}

export const Legend: React.FC<LegendProps> = React.memo(
  ({ data, showLegend, legendPlacement }) => {
    if (!showLegend) {
      return null;
    }

    return (
      <LegendWrapper style={{ justifyContent: legendPlacement }}>
        {getDataAsArray(data).map(
          ({ color = DEFAULT_LINE_COLOR, name }, index) => {
            const lineName = getLineName(name, index);
            return <LegendItem key={lineName} color={color} label={lineName} />;
          }
        )}
      </LegendWrapper>
    );
  }
);

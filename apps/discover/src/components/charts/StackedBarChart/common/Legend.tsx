import { useMemo } from 'react';

import uniqueId from 'lodash/uniqueId';

import { Checkbox } from '@cognite/cogs.js';

import { FlexColumn, FlexRow } from 'styles/layout';

import { ChartLegend, ChartLegendIsolated, LegendTitle } from '../elements';
import { LegendProps } from '../types';

export const Legend = ({
  checkboxState,
  barColorConfig,
  onChange,
  title,
  isolateLegend = true,
  floatingHeight,
}: LegendProps) => {
  const { colors, defaultColor } = barColorConfig;

  const checkboxes = useMemo(
    () =>
      Object.keys(checkboxState).map((option) => (
        <Checkbox
          key={option}
          name={uniqueId(option)}
          checked={checkboxState[option]}
          color={colors[option] || defaultColor}
          onChange={(checked: boolean) => onChange(option, checked)}
          data-testid="legend-checkbox"
        >
          {option}
        </Checkbox>
      )),
    [checkboxState]
  );

  const LegendContent = (
    <FlexColumn>
      {title && <LegendTitle>{title}</LegendTitle>}
      <FlexRow>{checkboxes}</FlexRow>
    </FlexColumn>
  );

  const LegendInsideIsolatedBox = (
    <ChartLegendIsolated>{LegendContent}</ChartLegendIsolated>
  );

  return (
    <ChartLegend className="chart-legend" floatingHeight={floatingHeight}>
      {isolateLegend ? LegendInsideIsolatedBox : LegendContent}
    </ChartLegend>
  );
};

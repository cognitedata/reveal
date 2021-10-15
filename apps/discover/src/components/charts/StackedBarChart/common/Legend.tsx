import { useMemo } from 'react';

import { Checkbox } from '@cognite/cogs.js';

import { FlexColumn, FlexRow } from 'styles/layout';

import { ChartLegend, ChartLegendIsolated, LegendTitle } from '../elements';
import { LegendProps } from '../types';

export const Legend = ({
  checkboxState,
  barColorConfig,
  offset,
  onChange,
  title,
  isolateLegend = true,
}: LegendProps) => {
  const { colors, defaultColor } = barColorConfig;

  const legendCheckboxOptions = Object.keys(checkboxState);

  const checkboxes = useMemo(
    () =>
      legendCheckboxOptions.map((option) => (
        <Checkbox
          key={option}
          name={option}
          checked={checkboxState[option]}
          color={colors[option] || defaultColor}
          onChange={(checked: boolean) => onChange(option, checked)}
          data-testid="legend-checkbox"
        >
          {option}
        </Checkbox>
      )),
    [legendCheckboxOptions, checkboxState]
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
    <ChartLegend offset={offset}>
      {isolateLegend ? LegendInsideIsolatedBox : LegendContent}
    </ChartLegend>
  );
};

import { useMemo } from 'react';

import { Checkbox } from '@cognite/cogs.js';

import { FlexColumn, FlexRow } from 'styles/layout';

import { ChartLegend, LegendTitle } from '../elements';
import { LegendProps } from '../types';

export const Legend = ({
  checkboxState,
  barColorConfig,
  offsetleft,
  onChange,
  title,
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

  return (
    <ChartLegend offsetleft={offsetleft}>
      <FlexColumn>
        {title && <LegendTitle>{title}</LegendTitle>}
        <FlexRow>{checkboxes}</FlexRow>
      </FlexColumn>
    </ChartLegend>
  );
};

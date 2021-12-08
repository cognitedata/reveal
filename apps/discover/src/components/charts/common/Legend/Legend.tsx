import { useMemo } from 'react';

import isUndefined from 'lodash/isUndefined';

import { Checkbox } from '@cognite/cogs.js';

import { LEGEND_FLOATING_HEIGHT } from 'components/charts/constants';
import { ChartId } from 'components/charts/types';
import { FlexColumn, FlexRow } from 'styles/layout';

import { ChartLegend, ChartLegendIsolated, LegendTitle } from './elements';
import { LegendProps } from './types';

export const Legend = ({
  id,
  legendCheckboxState,
  colorConfig,
  onChangeLegendCheckbox,
  isolateLegend = true,
  legendOptions,
}: LegendProps & ChartId) => {
  if (isUndefined(colorConfig)) {
    return null;
  }

  const { colors, defaultColor } = colorConfig;
  const title = legendOptions?.title;

  const floatingHeight = legendOptions?.overlay
    ? LEGEND_FLOATING_HEIGHT
    : undefined;

  const checkboxes = useMemo(
    () =>
      Object.keys(legendCheckboxState).map((option) => {
        const key = `${id}-${option}`;
        return (
          <Checkbox
            key={key}
            name={key}
            checked={legendCheckboxState[option]}
            color={colors[option] || defaultColor}
            onChange={(checked: boolean) =>
              onChangeLegendCheckbox(option, checked)
            }
            data-testid="legend-checkbox"
          >
            {option}
          </Checkbox>
        );
      }),
    [legendCheckboxState]
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

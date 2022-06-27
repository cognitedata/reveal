import { useMemo } from 'react';

import isUndefined from 'lodash/isUndefined';

import { Checkbox } from '@cognite/cogs.js';

import { LEGEND_FLOATING_HEIGHT } from 'components/Charts/constants';
import { ChartId } from 'components/Charts/types';
import { FlexColumn, FlexRow, sizes } from 'styles/layout';

import { ChartLegend, ChartLegendIsolated, LegendTitle } from './elements';
import { LegendProps } from './types';

type LegendWithColorConfigProps = Omit<LegendProps, 'colorConfig'> &
  ChartId & { colorConfig: Required<LegendProps>['colorConfig'] };

const LegendWithColorConfig = ({
  id,
  legendCheckboxState,
  colorConfig,
  onChangeLegendCheckbox,
  isolateLegend = true,
  legendOptions,
  getInfoIcon,
}: LegendWithColorConfigProps) => {
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
            {getInfoIcon && getInfoIcon(option)}
          </Checkbox>
        );
      }),
    [
      legendCheckboxState,
      colors,
      defaultColor,
      getInfoIcon,
      id,
      onChangeLegendCheckbox,
    ]
  );

  const LegendContent = (
    <FlexColumn>
      {title && <LegendTitle>{title}</LegendTitle>}
      <FlexRow>{checkboxes}</FlexRow>
    </FlexColumn>
  );

  const LegendInsideIsolatedBox = (
    <ChartLegendIsolated
      style={{
        marginTop: floatingHeight ? `-${floatingHeight}px` : sizes.medium,
      }}
    >
      {LegendContent}
    </ChartLegendIsolated>
  );

  return (
    <ChartLegend className="chart-legend">
      {isolateLegend ? LegendInsideIsolatedBox : LegendContent}
    </ChartLegend>
  );
};

export const Legend = ({
  colorConfig,
  ...restProps
}: LegendProps & ChartId) => {
  if (isUndefined(colorConfig)) {
    return null;
  }

  return <LegendWithColorConfig colorConfig={colorConfig} {...restProps} />;
};

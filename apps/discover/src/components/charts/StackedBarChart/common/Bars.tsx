import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import uniqueId from 'lodash/uniqueId';
import { followCursor } from 'tippy.js';

import { Icon } from '@cognite/cogs.js';

import { sortObjectsDecending } from '_helpers/sort';

import {
  DEFAULT_NO_DATA_AMONG_SELECTED_CHECKBOXES_TEXT,
  DEFAULT_NO_DATA_TEXT,
} from '../constants';
import { BarComponent, BarLabel, Bar, BarTooltip, BarText } from '../elements';
import { useXScaleMaxValue } from '../hooks/useXScaleMaxValue';
import { DataObject, BarsProps } from '../types';
import {
  getBarFillColorForDataElement,
  getDefaultBarColorConfig,
  getStackedData,
} from '../utils';

export const Bars = <T extends DataObject<T>>({
  groupedData,
  scales,
  accessors,
  legendAccessor,
  margins,
  barComponentDimensions,
  options,
  formatTooltip,
}: BarsProps<T>) => {
  const barColorConfig =
    options?.barColorConfig || getDefaultBarColorConfig(legendAccessor);

  const noDataAmongSelectedCheckboxesText =
    options?.noDataAmongSelectedCheckboxesText ||
    DEFAULT_NO_DATA_AMONG_SELECTED_CHECKBOXES_TEXT;

  const noDataText = options?.noDataText || DEFAULT_NO_DATA_TEXT;

  const { x: xScale, y: yScale } = scales;
  const { x: xAccessor, y: yAccessor } = accessors;

  const xScaleMaxValue = useXScaleMaxValue<T>({
    groupedData,
    xAccessor,
  });

  return (
    <g>
      {Object.keys(groupedData).map((key) => {
        const data = groupedData[key];
        const maxValue = Math.max(
          ...data.map((dataElement) => dataElement[xAccessor])
        );
        const { stackedData, noDataToStack } = getStackedData<T>(
          data,
          xAccessor
        );
        const orderedData = sortObjectsDecending<T>(
          stackedData,
          'stackedWidth'
        );

        return (
          <BarComponent
            key={key}
            x={margins.left}
            y={yScale(data[0][yAccessor])}
            width={barComponentDimensions.width}
            height={barComponentDimensions.height}
          >
            <BarLabel level={2} default strong data-testid="bar-label">
              {key}
              <Icon type="ChevronRightCompact" size={14} />
            </BarLabel>

            {orderedData.map((dataElement) => {
              const { stackedWidth } = dataElement;
              const xValue = dataElement[xAccessor];

              const width = noDataToStack
                ? xScale(xScaleMaxValue as any)
                : xScale(stackedWidth);

              const rounded = noDataToStack || parseFloat(xValue) === maxValue;

              const tooltip = formatTooltip
                ? formatTooltip(dataElement)
                : xValue;

              const barFillColor = getBarFillColorForDataElement(
                dataElement,
                barColorConfig,
                noDataToStack
              );

              let barText = noDataAmongSelectedCheckboxesText;

              if (isUndefined(get(dataElement, barColorConfig?.accessor))) {
                barText = noDataText;
              }

              if (!stackedWidth && !noDataToStack) return null;

              return (
                <BarTooltip
                  key={uniqueId(key)}
                  content={tooltip}
                  placement="bottom"
                  followCursor="horizontal"
                  plugins={[followCursor]}
                  disabled={noDataToStack || isEmpty(tooltip)}
                >
                  <Bar
                    width={width}
                    fill={barFillColor}
                    rounded={rounded}
                    data-testid="bar"
                  >
                    {noDataToStack && (
                      <BarText level={2} default strong data-testid="bar-text">
                        {barText}
                      </BarText>
                    )}
                  </Bar>
                </BarTooltip>
              );
            })}
          </BarComponent>
        );
      })}
    </g>
  );
};

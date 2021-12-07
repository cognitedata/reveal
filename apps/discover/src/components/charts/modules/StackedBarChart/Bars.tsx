import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import uniqueId from 'lodash/uniqueId';
import { followCursor } from 'tippy.js';

import { Icon } from '@cognite/cogs.js';

import { sortObjectsDecending } from '_helpers/sort';
import { DataObject } from 'components/charts/types';

import {
  BAR_STACKED_WIDTH_ACCESSOR,
  DEFAULT_NO_DATA_AMONG_SELECTED_CHECKBOXES_TEXT,
  DEFAULT_NO_DATA_TEXT,
} from './constants';
import { BarComponent, BarLabel, Bar, BarTooltip, BarText } from './elements';
import { BarsProps } from './types';
import {
  getBarFillColorForDataElement,
  getBarFillColorForDisabledBar,
  getStackedData,
} from './utils';

export const Bars = <T extends DataObject<T>>({
  initialGroupedData,
  groupedData,
  scales,
  xScaleMaxValue,
  yScaleDomain,
  accessors,
  colorConfig,
  margins,
  barComponentDimensions,
  options,
  onSelectBar,
}: BarsProps<T>) => {
  const noDataAmongSelectedCheckboxesBarText =
    options?.noDataAmongSelectedCheckboxesText ||
    DEFAULT_NO_DATA_AMONG_SELECTED_CHECKBOXES_TEXT;

  const noDataBarText = options?.noDataText || DEFAULT_NO_DATA_TEXT;

  const { x: xScale, y: yScale } = scales;
  const { x: xAccessor } = accessors;

  const renderBarsWithData = (data: T[]) => {
    const stackedData = getStackedData<T>(data, xAccessor);
    const orderedData = sortObjectsDecending<T>(
      stackedData,
      BAR_STACKED_WIDTH_ACCESSOR
    );
    const maxValue = Math.max(
      ...orderedData.map((dataElement) =>
        get(dataElement, BAR_STACKED_WIDTH_ACCESSOR)
      )
    );

    return orderedData.map((dataElement) => {
      const stackedWidth = get(dataElement, BAR_STACKED_WIDTH_ACCESSOR);
      const xValue = get(dataElement, xAccessor);
      const rounded = stackedWidth === maxValue;

      const tooltip = options?.formatTooltip
        ? options.formatTooltip(dataElement)
        : xValue;

      const barFillColor = getBarFillColorForDataElement(
        dataElement,
        colorConfig
      );

      if (!stackedWidth) return null;

      return (
        <BarTooltip
          key={uniqueId(xValue)}
          content={tooltip}
          placement="bottom"
          followCursor="horizontal"
          plugins={[followCursor]}
          disabled={isEmpty(tooltip)}
        >
          <Bar
            width={xScale(stackedWidth)}
            fill={barFillColor}
            rounded={rounded}
            data-testid="bar"
          />
        </BarTooltip>
      );
    });
  };

  const renderDisabledBar = (barText: string) => {
    return (
      <Bar
        width={xScale(xScaleMaxValue as any)}
        fill={getBarFillColorForDisabledBar(colorConfig)}
        rounded
        data-testid="no-data-bar"
      >
        <BarText level={2} default strong data-testid="bar-text">
          {barText}
        </BarText>
      </Bar>
    );
  };

  return (
    <g>
      {yScaleDomain.map((key, index) => {
        const initialData = get(initialGroupedData, key, []);
        const data = get(groupedData, key, []);

        const isNoData = isEmpty(initialData);
        const isNoDataAmongSelectedCheckboxes = !isNoData && isEmpty(data);
        const isBarDisabled = isNoData || isNoDataAmongSelectedCheckboxes;

        const handleSelectBar = () => {
          if (!isNoData) {
            onSelectBar(key, index);
          }
        };

        return (
          <BarComponent
            key={key}
            x={margins.left}
            y={yScale(key as any)}
            width={barComponentDimensions.width}
            height={barComponentDimensions.height}
            onClick={handleSelectBar}
          >
            {!options?.hideBarLabels && (
              <BarLabel
                level={2}
                default
                strong
                disabled={isNoData}
                data-testid="bar-label"
              >
                {key}
                {!isNoData && <Icon type="ChevronRight" size={14} />}
              </BarLabel>
            )}

            {isNoDataAmongSelectedCheckboxes &&
              renderDisabledBar(noDataAmongSelectedCheckboxesBarText)}

            {isNoData && renderDisabledBar(noDataBarText)}

            {!isBarDisabled && renderBarsWithData(data)}
          </BarComponent>
        );
      })}
    </g>
  );
};

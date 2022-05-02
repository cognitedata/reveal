import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { followCursor } from 'tippy.js';

import { Icon } from '@cognite/cogs.js';

import { DataObject } from 'components/Charts/types';
import { useDeepMemo } from 'hooks/useDeep';
import { sizes } from 'styles/layout';

import {
  DEFAULT_NO_DATA_AMONG_SELECTED_CHECKBOXES_TEXT,
  DEFAULT_NO_DATA_TEXT,
} from './constants';
import {
  BarComponent,
  BarLabel,
  Bar,
  BarTooltip,
  BarText,
  BarDisabled,
} from './elements';
import { BarsProps } from './types';
import {
  getBarFillColorForDataElement,
  getBarFillColorForDisabledBar,
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

  const renderBarsWithData = (data: T[], groupKey: string) => {
    let barOffsetLeft = 0;

    return data.map((dataElement, index) => {
      const xValue = get(dataElement, xAccessor);
      const barWidth = xScale(xValue);

      if (isUndefined(barWidth)) return null;

      const key = `${groupKey}-${get(
        dataElement,
        colorConfig?.accessor
      )}-${xValue}`;

      const tooltip = options?.formatTooltip
        ? options.formatTooltip(dataElement)
        : xValue;

      const barComponent = (
        <BarTooltip
          key={key}
          content={tooltip}
          placement="bottom"
          followCursor="horizontal"
          plugins={[followCursor]}
          disabled={isEmpty(tooltip)}
        >
          <Bar
            data-testid="bar"
            style={{
              width: barWidth,
              left: barOffsetLeft,
              background: getBarFillColorForDataElement(
                dataElement,
                colorConfig
              ),
              borderRadius: getBarSegmentBorderRadius(data, index),
            }}
          />
        </BarTooltip>
      );

      barOffsetLeft += barWidth;

      return barComponent;
    });
  };

  const renderDisabledBar = (barText: string, key: string) => {
    return (
      <BarDisabled
        data-testid="no-data-bar"
        key={key}
        style={{
          width: xScale(xScaleMaxValue as any),
          background: getBarFillColorForDisabledBar(colorConfig),
        }}
      >
        <BarText level={2} default strong data-testid="bar-text">
          {barText}
        </BarText>
      </BarDisabled>
    );
  };

  const getBarSegmentBorderRadius = (data: T[], index: number) => {
    if (data.length === 1) return `${sizes.extraSmall}`;

    const isFirstBar = index === 0;
    const isLastBar = index === data.length - 1;

    if (isFirstBar) return `${sizes.extraSmall} 0 0 ${sizes.extraSmall}`;
    if (isLastBar) return `0 ${sizes.extraSmall} ${sizes.extraSmall} 0`;
    return null;
  };

  return useDeepMemo(
    () => (
      <g>
        {yScaleDomain.map((key, index) => {
          const initialData = get(initialGroupedData, key, [] as T[]);
          const data = get(groupedData, key, [] as T[]);

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
                renderDisabledBar(noDataAmongSelectedCheckboxesBarText, key)}

              {isNoData && renderDisabledBar(noDataBarText, key)}

              {!isBarDisabled && renderBarsWithData(data, key)}
            </BarComponent>
          );
        })}
      </g>
    ),
    [groupedData, yScaleDomain, xScale]
  );
};

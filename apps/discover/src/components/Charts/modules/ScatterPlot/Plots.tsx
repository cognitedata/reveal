import { useState } from 'react';

import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { DataObject } from 'components/Charts/types';

import { Plot, PlotContainer, PlotTooltip } from './elements';
import { PlotsProps } from './types';
import { getPlotColorForDataElement } from './utils';

export const Plots = <T extends DataObject<T>>({
  data,
  scales,
  accessors,
  colorConfig,
  options,
  renderPlotHoverComponent,
}: PlotsProps<T>) => {
  const { x: xScale, y: yScale } = scales;
  const { x: xAccessor, y: yAccessor } = accessors;
  const [selected, setSelected] = useState<string>('');

  return (
    <g>
      {data.map((dataElement) => {
        const xValue = get(dataElement, xAccessor);
        const yValue = get(dataElement, yAccessor);
        const plotColor = getPlotColorForDataElement(dataElement, colorConfig);
        const key = `${xValue}-${yValue}`;

        const tooltip = options?.formatTooltip
          ? options.formatTooltip(dataElement)
          : xValue;

        const tooltipContent = renderPlotHoverComponent
          ? renderPlotHoverComponent(dataElement)
          : tooltip;

        return (
          <PlotContainer
            key={key}
            x={xScale(xValue)}
            y={yScale(yValue)}
            onClick={() =>
              setSelected((prevValue) => (prevValue === key ? '' : key))
            }
          >
            <PlotTooltip
              content={tooltipContent}
              placement={renderPlotHoverComponent ? 'auto' : 'top'}
              visible={isEqual(selected, key)}
              onClickOutside={() => setSelected('')}
              inverted
            >
              <Plot data-testid="plot" style={{ background: plotColor }} />
            </PlotTooltip>
          </PlotContainer>
        );
      })}
    </g>
  );
};

import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';

import { DataObject } from 'components/charts/types';

import { Plot, PlotContainer, PlotTooltip, PlotTooltipHTML } from './elements';
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

  return (
    <g>
      {data.map((dataElement) => {
        const xValue = get(dataElement, xAccessor);
        const yValue = get(dataElement, yAccessor);
        const plotColor = getPlotColorForDataElement(dataElement, colorConfig);

        const tooltip = options?.formatTooltip
          ? options.formatTooltip(dataElement)
          : xValue;

        const tooltipContent = renderPlotHoverComponent
          ? renderPlotHoverComponent(dataElement)
          : tooltip;

        const PlotElement = <Plot color={plotColor} data-testid="plot" />;

        return (
          <PlotContainer key={uniqueId()} x={xScale(xValue)} y={yScale(yValue)}>
            {renderPlotHoverComponent ? (
              <PlotTooltipHTML
                content={tooltipContent}
                arrow={false}
                placement="auto"
              >
                {PlotElement}
              </PlotTooltipHTML>
            ) : (
              <PlotTooltip content={tooltipContent} placement="top">
                {PlotElement}
              </PlotTooltip>
            )}
          </PlotContainer>
        );
      })}
    </g>
  );
};

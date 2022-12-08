import { Body, Detail } from '@cognite/cogs.js';
import React from 'react';

import { Container, StyledPlot } from './elements';
import { chartPropsAreEqual, CommonChartProps } from './utils';

export const CommonChart = React.memo(
  ({
    title,
    subTitle,
    data,
    layout,
    chartStyles,
    onHover,
    onUnhover,
  }: CommonChartProps) => (
    <Container>
      {title && (
        <Body level="medium" strong>
          {title}
        </Body>
      )}
      {subTitle && <Detail className="subtitle">{subTitle}</Detail>}
      <StyledPlot
        data={data}
        layout={layout}
        style={chartStyles}
        config={{
          responsive: true,
          displayModeBar: 'hover',
          modeBarButtons: [['zoomIn2d', 'zoomOut2d', 'resetScale2d']],
          displaylogo: false,
          scrollZoom: true,
        }}
        onHover={onHover}
        onUnhover={onUnhover}
      />
    </Container>
  ),
  chartPropsAreEqual
);

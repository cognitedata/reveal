import * as React from 'react';

import { ChartSubtitle, ChartTitle } from './elements';

export interface ChartTitlesProps {
  title?: string;
  subtitle?: string;
}

export const ChartTitles: React.FC<ChartTitlesProps> = React.memo(
  ({ title, subtitle }) => {
    return (
      <>
        {title && <ChartTitle data-testid="chart-title">{title}</ChartTitle>}

        {subtitle && (
          <ChartSubtitle data-testid="chart-subtitle">{subtitle}</ChartSubtitle>
        )}
      </>
    );
  }
);

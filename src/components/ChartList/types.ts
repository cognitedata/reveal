import PlotlyChart from 'components/PlotlyChart/PlotlyChart';
import { ComponentProps } from 'react';

export interface ChartListProps {
  loading: boolean;
  readOnly?: boolean;
  list: {
    id: string;
    name: string;
    owner: string;
    updatedAt: string;
    loadingPlot: boolean;
    plotlyProps: ComponentProps<typeof PlotlyChart> | undefined;
  }[];
  onChartClick: (chartId: string) => void;
  onChartDuplicateClick: (chartId: string) => void;
  onChartDeleteClick: (chartId: string) => void;
}

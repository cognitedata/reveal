import { ChartItem } from 'hooks/charts/types';

export interface ChartListProps {
  loading: boolean;
  readOnly?: boolean;
  list: ChartItem[];
  emptyState?: JSX.Element;
  onChartClick: (chartId: string) => void;
  onChartDuplicateClick: (chartId: string) => void;
  onChartDeleteClick: (chartId: string) => void;
}

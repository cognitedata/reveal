import { ComponentProps } from 'react';
import PlotlyChart from 'components/PlotlyChart/PlotlyChart';
import { Flex } from '@cognite/cogs.js';
import ChartListGridItem from './ChartListGridItem';
import ChartListDropdown from '../ChartListDropdown/ChartListDropdown';

type Props = {
  loading: boolean;
  readOnly?: boolean;
  list: {
    id: string;
    name: string;
    owner: string;
    updatedAt: string;
    plotlyProps: ComponentProps<typeof PlotlyChart>;
  }[];
  onChartClick: (chartId: string) => void;
  onChartDuplicateClick: (chartId: string) => void;
  onChartDeleteClick: (chartId: string) => void;
  translations: typeof ChartListDropdown.defaultTranslations;
};

function ChartListGrid({
  loading,
  list,
  readOnly = false,
  onChartClick,
  onChartDuplicateClick,
  onChartDeleteClick,
  translations,
}: Props) {
  return (
    <Flex gap={15} wrap="wrap">
      {loading
        ? Array.from(Array(6).keys()).map((e) => (
            <ChartListGridItem.Loading key={e} />
          ))
        : list.map((row) => (
            <ChartListGridItem
              key={row.id}
              onClick={() => onChartClick(row.id)}
              onDuplicateClick={() => onChartDuplicateClick(row.id)}
              onDeleteClick={() => onChartDeleteClick(row.id)}
              name={row.name}
              plotlyProps={row.plotlyProps}
              updatedAt={row.updatedAt}
              owner={row.owner}
              readOnly={readOnly}
              translations={translations}
            />
          ))}
    </Flex>
  );
}

export default ChartListGrid;

import { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';

import Chart, { ChartConfiguration, ChartDataset } from 'chart.js/auto';
import isEqual from 'lodash/isEqual';

// TODO: move typedefs to llm-hub/ts-library/src/types.ts
type AggregateOperator = 'sum' | 'count' | 'max' | 'min' | 'avg';
type AggregateKeyValuePair = {
  [key: string]: number;
};
export type GroupedQueryResultItem = {
  [key in AggregateOperator]?: AggregateKeyValuePair;
} & {
  group: {
    [key: string]: string;
  };
};

const BASE_CHART_CONFIG: Omit<ChartConfiguration, 'data'> = {
  type: 'bar',
  options: {
    scales: {
      y: {
        beginAtZero: true,
        border: {
          color: '#fff',
          dash: [5, 5],
          width: 23,
        },
      },
      x: {
        title: {
          display: true,
        },
        border: { color: '#E5E5EF' },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        align: 'start',
        text: 'Statistics',
        font: {
          size: 13,
          weight: '400',
        },
      },
      subtitle: {
        display: true,
        align: 'start',
        font: {
          weight: '600',
        },
        padding: { bottom: 26 },
      },
    },
  },
};

const BASE_DATASET_OPTIONS = {
  barThickness: 16,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderWidth: 3,
  borderRadius: 7,
};

const DATASET_COLORS = [
  'rgb(152, 117, 224)', // purple
  'rgb(46, 15, 101)', // dark purple
];

const randomColor = () => Math.random() * 255;

export const AIResultAggregateChart = ({
  items,
}: {
  items: GroupedQueryResultItem[];
}) => {
  const [chartConfig, setChartConfig] = useState<ChartConfiguration>();
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const chartId = useRef<string | null>(null);

  useEffect(() => {
    if (chartId.current !== null) {
      return;
    }
    if (!chartContainer?.current || !items?.length) return;

    // merge dynamic values into chart config (datasets, labels, subtitle)
    const newChartConfig: ChartConfiguration = {
      ...BASE_CHART_CONFIG,
      data: {
        datasets: getChartDatasets(items),
        labels: getChartLabels(items),
      },
    };
    newChartConfig!.options!.plugins!.subtitle!.text = getChartSubtitle(items);

    if (!isEqual(newChartConfig, chartConfig)) {
      setChartConfig(newChartConfig);
      // instantiate & render the bar chart
      const chart = new Chart(chartContainer.current, newChartConfig);
      chartId.current = chart.id;
    }
  }, [chartConfig, chartContainer, items]);

  return (
    <>
      <ChartCanvas ref={chartContainer} data-testid="ai-chart"></ChartCanvas>
    </>
  );
};

const ChartCanvas = styled.canvas`
  background-color: #fff;
  padding: 16px 28px 0px;
  border-radius: 8px;
`;

export const getChartDatasets = (
  items: GroupedQueryResultItem[]
): ChartDataset[] => {
  // build chart.js datasets from query results
  const datasets: ChartDataset[] = [];
  for (const item of items) {
    for (const operator of Object.keys(item)) {
      if (operator === 'group') continue;

      const data: AggregateKeyValuePair = item[operator as AggregateOperator]!;
      for (const [key, value] of Object.entries(data)) {
        const datasetLabel = `${operator} of ${key}`;
        const dataset = datasets.find(({ label }) => label === datasetLabel);
        if (dataset) {
          dataset.data.push(value);
        } else {
          // first entry, so create new dataset
          datasets.push({
            ...BASE_DATASET_OPTIONS,
            label: datasetLabel,
            data: [value],
            backgroundColor:
              DATASET_COLORS[datasets.length] ||
              `rgba(${randomColor()}, ${randomColor()}, ${randomColor()})`,
          });
        }
      }
    }
  }
  return datasets;
};

export const getChartLabels = (items: GroupedQueryResultItem[]): string[] =>
  items.map((item) => Object.values(item.group)[0]);

export const getChartSubtitle = (items: GroupedQueryResultItem[]): string => {
  // get all unique keys under each aggregate operator in the query results
  const dataKeys = new Set<string>();
  for (const item of items) {
    for (const operator of Object.keys(item)) {
      if (operator !== 'group') {
        const data: AggregateKeyValuePair =
          item[operator as AggregateOperator]!;
        Object.keys(data).forEach((key) => dataKeys.add(key));
      }
    }
  }

  const xAxisUnitName = Object.keys(items[0].group)[0];
  return [...dataKeys].join(', ') + ` by ${xAxisUnitName}`;
};

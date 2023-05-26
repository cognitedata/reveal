import { ComponentStory } from '@storybook/react';
import get from 'lodash/get';

import { Button, Select } from '@cognite/cogs.js';

import { data as mockData } from './__mocks/data';
import { LineChart } from './LineChart';
import { LineChartProps } from './types';

export default {
  title: 'Shared/PlottingComponents/LineChart',
  component: LineChart,
};

const data = mockData.reduce(
  (result, [dataX, dataY]) => {
    return {
      x: [...result.x, dataX],
      y: [...result.y, dataY],
    } as any;
  },
  {
    x: [] as number[],
    y: [] as number[],
  }
);

const props: LineChartProps = {
  data: {
    ...data,
    customData: {
      timezone: '02:00 GMT(+02:00)',
    },
  },
  xAxis: { name: 'Date' },
  yAxis: { name: 'Value' },
  title: 'Main title',
  subtitle: 'Subtitle or description',
  config: {
    scrollZoom: 'x',
    selectionZoom: [
      { trigger: 'default', direction: 'x+y' },
      { trigger: 'Shift', direction: 'x' },
    ],
    buttonZoom: 'x',
  },
  renderFilters: () => [<Select options={[]} width={200} theme="filled" />],
  renderActions: () => [
    <Button role="link" size="small" type="ghost-accent" icon="LineChart">
      Open in Charts
    </Button>,
  ],
  formatHoverLineInfo: ({ x, customData }) =>
    `${String(x)}, ${get(customData, 'timezone')}`,
};

export const Basic: ComponentStory<typeof LineChart> = (args) => {
  return <LineChart {...args} />;
};
Basic.args = props;

const ChartWithWrapper: React.FC<
  LineChartProps & { wrapperStyle: React.CSSProperties }
> = ({ wrapperStyle, ...lineChartProps }) => {
  return (
    <div style={wrapperStyle}>
      <LineChart {...lineChartProps} />
    </div>
  );
};
export const WithWrapper: ComponentStory<typeof ChartWithWrapper> = (args) => {
  return <ChartWithWrapper {...args} />;
};
WithWrapper.args = {
  ...props,
  wrapperStyle: {
    height: 300,
    transform: 'scale(0.75)',
  },
};

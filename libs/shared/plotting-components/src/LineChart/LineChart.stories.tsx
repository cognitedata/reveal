import { Story } from '@storybook/react';

import { LineChart } from './LineChart';
import { LineChartProps } from './types';
import { data as mockData } from './__mocks/data';

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

const Template: Story<LineChartProps> = (args) => <LineChart {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  data,
  xAxis: { name: 'Date' },
  yAxis: { name: 'Value' },
  title: 'Main title',
  subtitle: 'Subtitle or description',
};

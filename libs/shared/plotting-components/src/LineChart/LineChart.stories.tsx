import { Story } from '@storybook/react';

import { Button, Select } from '@cognite/cogs.js';

import { LineChart } from './LineChart';
import { LineChartProps } from './types';
import { data as mockData } from './__mocks/data';
import get from 'lodash/get';

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

import { Meta, Story } from '@storybook/react';
import { plotExamplePropsWithAggregatedData } from 'components/PlotlyChart/PlotlyChart.mocks';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import ChartListTable from './ChartListTable';

export default {
  component: ChartListTable,
  title: 'Components/Chart List Page/Chart List Table',
  argTypes: {
    onChartClick: { action: 'Clicked to open the Chart' },
    onChartDeleteClick: { action: 'Clicked to delete the Chart' },
    onChartDuplicateClick: { action: 'Clicked to duplicate the Chart' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof ChartListTable>> = (args) => (
  <ChartListTable {...args} />
);

export const Default = Template.bind({});

const chartMock = {
  id: 'abc',
  name: 'Test Chart',
  owner: 'Rhuan',
  updatedAt: dayjs().toISOString(),
  plotlyProps: {
    plotExamplePropsWithAggregatedData,
    isPreview: true,
  } as ComponentProps<typeof ChartListTable>['list'][number]['plotlyProps'],
};

Default.args = {
  list: Array(4).fill(chartMock),
};

export const Loading = Template.bind({});

Loading.args = {
  list: [],
  loading: true,
};

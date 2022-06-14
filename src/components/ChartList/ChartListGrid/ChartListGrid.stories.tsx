import { Meta, Story } from '@storybook/react';
import { plotExamplePropsWithAggregatedData } from 'components/PlotlyChart/PlotlyChart.mocks';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import ChartListGrid from './ChartListGrid';

export default {
  component: ChartListGrid,
  title: 'Components/Chart List Page/Chart List Grid',
  argTypes: {
    onChartClick: { action: 'Clicked on the Chart' },
    onChartDuplicateClick: { action: 'Tried to duplicate the Chart' },
    onChartDeleteClick: { action: 'Tried to delete the Chart' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof ChartListGrid>> = (args) => (
  <ChartListGrid {...args} />
);

export const Default = Template.bind({});

Default.args = {
  list: Array(4).fill({
    id: 'abc',
    name: 'Test Chart',
    owner: 'Rhuan',
    updatedAt: dayjs().toISOString(),
    loadingPlot: false,
    plotlyProps: {
      plotExamplePropsWithAggregatedData,
      isPreview: true,
    } as ComponentProps<typeof ChartListGrid>['list'][number]['plotlyProps'],
  }),
};

export const LoadingPlot = Template.bind({});

LoadingPlot.args = {
  list: Array(4).fill({
    id: 'abc',
    name: 'Test Chart',
    owner: 'Rhuan',
    updatedAt: dayjs().toISOString(),
    loadingPlot: true,
    plotlyProps: undefined,
  }),
};

export const Loading = Template.bind({});

Loading.args = { ...Default.args, loading: true };

import { Meta, Story } from '@storybook/react';
import { plotExamplePropsWithAggregatedData } from 'components/PlotlyChart/PlotlyChart.mocks';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import ChartList from './ChartList';

export default {
  component: ChartList,
  title: 'Components/Chart List Page/Chart List',
  argTypes: {
    onChartClick: { action: 'Clicked to open the Chart' },
    onChartDeleteClick: { action: 'Clicked to delete the Chart' },
    onChartDuplicateClick: { action: 'Clicked to duplicate the Chart' },
  },
} as Meta;

type ChartListProps = ComponentProps<typeof ChartList>;

const Template: Story<ChartListProps> = (args) => <ChartList {...args} />;

const chartMock = {
  id: 'abc',
  name: 'Test Chart',
  owner: 'Rhuan',
  updatedAt: dayjs().toISOString(),
  plotlyProps: {
    plotExamplePropsWithAggregatedData,
    isPreview: true,
  } as ChartListProps['list'][number]['plotlyProps'],
};

export const Default = Template.bind({});

Default.args = {
  list: Array(4).fill(chartMock),
};

export const EmptyTable = Template.bind({});

EmptyTable.args = {
  list: [],
  loading: false,
};

export const EmptyGrid = Template.bind({});

EmptyGrid.args = {
  viewOption: 'grid',
  list: [],
  loading: false,
};

export const ErrorTable = Template.bind({});

ErrorTable.args = {
  list: [],
  loading: false,
  error: 'An Error Happened',
};

export const ErrorGrid = Template.bind({});

ErrorGrid.args = {
  viewOption: 'grid',
  list: [],
  loading: false,
  error: 'An Error Happened',
};

export const LoadingTable = Template.bind({});

LoadingTable.args = {
  list: [],
  loading: true,
};

export const LoadingGrid = Template.bind({});

LoadingGrid.args = {
  viewOption: 'grid',
  list: [],
  loading: true,
};

export const LoadingTableOnlyPlots = Template.bind({});

LoadingTableOnlyPlots.args = {
  list: Array(4).fill({
    ...chartMock,
    loadingPlot: true,
    plotlyProps: undefined,
  }),
};

export const LoadingGridOnlyPlots = Template.bind({});

LoadingGridOnlyPlots.args = {
  viewOption: 'grid',
  list: Array(4).fill({
    ...chartMock,
    loadingPlot: true,
    plotlyProps: undefined,
  }),
};

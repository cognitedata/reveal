import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import ChartList from './ChartList';
import { ChartListContext, ChartListContextInterface } from './context';
import { PreviewPlotContainerMock } from './mocks';

export default {
  component: ChartList,
  title: 'Components/Chart List Page/Chart List',
  argTypes: {
    onChartClick: { action: 'Clicked to open the Chart' },
    onChartDeleteClick: { action: 'Clicked to delete the Chart' },
    onChartDuplicateClick: { action: 'Clicked to duplicate the Chart' },
  },
  decorators: [
    (story, { parameters }) => {
      return (
        <ChartListContext.Provider value={parameters.mocks}>
          {story()}
        </ChartListContext.Provider>
      );
    },
  ],
} as Meta;

type ChartListProps = ComponentProps<typeof ChartList>;

const Template: Story<ChartListProps> = (args) => <ChartList {...args} />;

const chartMock = {
  id: 'abc',
  name: 'Test Chart',
  owner: 'Rhuan',
  updatedAt: dayjs().toISOString(),
};

export const Default = Template.bind({});

Default.args = {
  list: Array(4).fill(chartMock),
};

Default.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const EmptyTable = Template.bind({});

EmptyTable.args = {
  list: [],
  loading: false,
};

EmptyTable.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const EmptyGrid = Template.bind({});

EmptyGrid.args = {
  viewOption: 'grid',
  list: [],
  loading: false,
};

EmptyGrid.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const ErrorTable = Template.bind({});

ErrorTable.args = {
  list: [],
  loading: false,
  error: 'An Error Happened',
};

ErrorTable.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const ErrorGrid = Template.bind({});

ErrorGrid.args = {
  viewOption: 'grid',
  list: [],
  loading: false,
  error: 'An Error Happened',
};

ErrorGrid.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const LoadingTable = Template.bind({});

LoadingTable.args = {
  list: [],
  loading: true,
};

LoadingTable.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const LoadingGrid = Template.bind({});

LoadingGrid.args = {
  viewOption: 'grid',
  list: [],
  loading: true,
};

LoadingGrid.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const LoadingTableOnlyPlots = Template.bind({});

LoadingTableOnlyPlots.args = {
  list: Array(4).fill({
    ...chartMock,
    loadingPlot: true,
    plotlyProps: undefined,
  }),
};

LoadingTableOnlyPlots.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
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

LoadingGridOnlyPlots.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

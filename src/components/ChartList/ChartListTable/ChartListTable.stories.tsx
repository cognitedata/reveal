import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import { ChartListContext, ChartListContextInterface } from '../context';
import { PreviewPlotContainerMock } from '../mocks';
import ChartListTable from './ChartListTable';

export default {
  component: ChartListTable,
  title: 'Components/Chart List Page/Chart List Table',
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

const Template: Story<ComponentProps<typeof ChartListTable>> = (args) => (
  <ChartListTable {...args} />
);

export const Default = Template.bind({});

const chartMock = {
  id: 'abc',
  name: 'Test Chart',
  owner: 'Rhuan',
  updatedAt: dayjs().toISOString(),
};

Default.args = {
  list: Array(4).fill(chartMock),
};

Default.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const Loading = Template.bind({});

Loading.args = {
  list: [],
  loading: true,
};

Loading.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const LoadingOnlyPlots = Template.bind({});

LoadingOnlyPlots.args = {
  list: Array(4).fill({
    ...chartMock,
    loadingPlot: true,
    plotlyProps: undefined,
  }),
};

LoadingOnlyPlots.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

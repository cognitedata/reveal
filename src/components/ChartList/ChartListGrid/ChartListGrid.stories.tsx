import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import { ComponentProps } from 'react';
import { ChartListContext, ChartListContextInterface } from '../context';
import { PreviewPlotContainerMock } from '../mocks';
import ChartListGrid from './ChartListGrid';

export default {
  component: ChartListGrid,
  title: 'Components/Chart List Page/Chart List Grid',
  argTypes: {
    onChartClick: { action: 'Clicked on the Chart' },
    onChartDuplicateClick: { action: 'Tried to duplicate the Chart' },
    onChartDeleteClick: { action: 'Tried to delete the Chart' },
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
  }),
};

Default.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
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

LoadingPlot.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const Loading = Template.bind({});

Loading.args = { ...Default.args, loading: true };

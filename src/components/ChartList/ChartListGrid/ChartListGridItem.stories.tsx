import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { ChartListContext, ChartListContextInterface } from '../context';
import { PreviewPlotContainerMock } from '../mocks';
import ChartListGridItem from './ChartListGridItem';

export default {
  component: ChartListGridItem,
  title: 'Components/Chart List Page/Chart List Grid Item',
  argTypes: {
    onClick: { action: 'Clicked on the Chart' },
    onDeleteClick: { action: 'Tried to delete the Chart' },
    onDuplicateClick: { action: 'Tried to duplicate the Chart' },
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

const Template: Story<ComponentProps<typeof ChartListGridItem>> = (args) => (
  <ChartListGridItem {...args} />
);

export const Default = Template.bind({});

Default.args = {
  name: 'Demo: Power Consumption Copy Copy djsfkljdsklf fdsf dsfdsf sdfdsfds',
  updatedAt: new Date('2022-05-06T22:12:56Z').toISOString(),
  owner: 'rhuan.barreto@cognite.com',
};

Default.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const LoadingPlot = Template.bind({});

LoadingPlot.args = {
  name: 'Demo: Power Consumption Copy Copy djsfkljdsklf fdsf dsfdsf sdfdsfds',
  updatedAt: new Date('2022-05-06T22:12:56Z').toISOString(),
  owner: 'rhuan.barreto@cognite.com',
};

LoadingPlot.parameters = {
  mocks: {
    PreviewPlotContainer: PreviewPlotContainerMock,
  } as ChartListContextInterface,
};

export const Loading: Story = () => <ChartListGridItem.Loading />;

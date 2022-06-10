import { Meta, Story } from '@storybook/react';
import { plotExamplePropsWithAggregatedData } from 'components/PlotlyChart/PlotlyChart.mocks';
import { ComponentProps } from 'react';
import ChartListGridItem from './ChartListGridItem';

export default {
  component: ChartListGridItem,
  title: 'Components/Chart List Page/Chart List Grid Item',
  argTypes: {
    onClick: { action: 'Clicked on the Chart' },
    onDeleteClick: { action: 'Tried to delete the Chart' },
    onDuplicateClick: { action: 'Tried to duplicate the Chart' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof ChartListGridItem>> = (args) => (
  <ChartListGridItem {...args} />
);

export const Default = Template.bind({});

Default.args = {
  name: 'Demo: Power Consumption Copy Copy djsfkljdsklf fdsf dsfdsf sdfdsfds',
  plotlyProps: {
    plotExamplePropsWithAggregatedData,
    isPreview: true,
  } as ComponentProps<typeof ChartListGridItem>['plotlyProps'],
  updatedAt: new Date('2022-05-06T22:12:56Z').toISOString(),
  owner: 'rhuan.barreto@cognite.com',
};

export const Loading: Story = () => <ChartListGridItem.Loading />;

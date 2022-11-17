import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { RKOMBidSequenceTable } from 'components/RKOMBidSequenceTable/RKOMBidSequenceTable';

import { LoadingRKOMBidSequenceTable } from './RKOMBidSequenceTableContainer';

export default {
  component: RKOMBidSequenceTable,
  title: 'Components/RKOM Bid Sequence Table',
  argTypes: { onReloadClick: { action: 'Reload Triggered' } },
} as Meta;

const Template: Story<ComponentProps<typeof RKOMBidSequenceTable>> = (args) => (
  <RKOMBidSequenceTable {...args} />
);

export const Default = Template.bind({});

Default.args = {
  prices: Array(10).fill(5),
  priceUnit: 'EUR/MW/hour',
  volumes: Array(10).fill(10),
  volumeUnit: 'MW',
};

const LoadingTemplate: Story<
  ComponentProps<typeof LoadingRKOMBidSequenceTable>
> = () => <LoadingRKOMBidSequenceTable />;

export const Loading = LoadingTemplate.bind({});

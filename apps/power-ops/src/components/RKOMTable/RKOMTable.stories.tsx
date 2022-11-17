import { Meta, Story } from '@storybook/react';
import { RKOMBidSequenceTable } from 'components/RKOMBidSequenceTable/RKOMBidSequenceTable';
import { RKOMTable } from 'components/RKOMTable/RKOMTable';
import { ComponentProps } from 'react';

export default {
  component: RKOMTable,
  title: 'Components/RKOM Table',
  argTypes: {
    onSelectBid: { action: 'Selected Bids' },
  },
} as Meta;

const Template: Story<ComponentProps<typeof RKOMTable>> = (args) => (
  <RKOMTable {...args} />
);

export const Default = Template.bind({});

Default.args = {
  data: Array(4)
    .fill(1)
    .map((_, i) => ({
      name: `Watercourse name ${i}`,
      subRows: [
        {
          watercourseName: `Watercourse name ${i}`,
          name: `Multiscenario 8 ${i}`,
          generationDate: new Date('2022-11-10T09:01:04.797Z').toISOString(),
          bidDate: new Date('2022-11-12').toISOString(),
          minimumPrice: '0.0',
          premiumPrice: '0.0',
          penalties: undefined,
          subRows: [{ sequenceExternalId: '123' }],
        },
        {
          watercourseName: `Watercourse name ${i}`,
          name: `Multiscenario 10 ${i}`,
          generationDate: new Date('2022-11-10T09:03:25.766Z').toISOString(),
          bidDate: new Date('2022-11-12').toISOString(),
          minimumPrice: '0.0',
          premiumPrice: '0.0',
          penalties: 'Above limit',
          subRows: [{ sequenceExternalId: 'loading' }],
        },
        {
          watercourseName: `Watercourse name ${i}`,
          name: `Multiscenario 11 ${i}`,
          generationDate: new Date('2022-11-08T08:24:34.389Z').toISOString(),
          bidDate: new Date('2022-11-12').toISOString(),
          minimumPrice: '0.0',
          premiumPrice: '0.0',
          penalties: 'Above limit',
          subRows: [{ sequenceExternalId: 'error' }],
        },
      ],
    })),
  bidSequenceTableComponent: () => (
    <RKOMBidSequenceTable
      prices={Array(10).fill(5)}
      priceUnit="EUR/MW/hour"
      volumes={Array(10).fill(10)}
      volumeUnit="MW"
    />
  ),
};

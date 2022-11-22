import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { RKOMHeader } from 'components/RKOMHeader/RKOMHeader';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { auctionOptions, blockOptions, productOptions } from 'pages/RKOM/utils';
import dayjs from 'dayjs';
import { formatDate } from 'utils/utils';

export default {
  component: RKOMHeader,
  title: 'Components/RKOM Header',
  argTypes: {
    onAuctionValueChange: { action: 'Auction Value Changed' },
    onBlockValueChange: { action: 'Block Value Changed' },
    onDownloadButtonClick: { action: 'Download Button Clicked' },
    onPriceAreaValueChange: { action: 'Price Area Value Changed' },
    onProductValueChange: { action: 'Product Value Changed' },
    onDeliveryWeekValueChange: { action: 'Delivery Week Value Changed' },
  },
  parameters: {
    chromatic: { viewports: [1366] },
  },
} as Meta;

const Template: Story<ComponentProps<typeof RKOMHeader>> = (args) => (
  <RKOMHeader {...args} />
);

export const Default = Template.bind({});

Default.args = {
  lastUpdated: formatDate(new Date('2022-11-10T09:01:04.797Z').toISOString()),
  priceAreaOptions: [1, 2, 3, 4, 5].map((i) => ({
    label: `NO${i}`,
    value: `NO${i}`,
  })),
  priceAreaValue: { label: 'NO1', value: 'NO1' },
  auctionValue: auctionOptions[0],
  blockValue: blockOptions[0],
  disabledDownload: true,
  downloading: false,
  productValue: productOptions[0],
  deliveryWeekValue: dayjs().startOf('week').format('YYYY-MM-DD'),
};

export const BidSelected = Template.bind({});

BidSelected.args = {
  ...Default.args,
  disabledDownload: false,
};

export const Interactions = Template.bind({});

Interactions.args = { ...BidSelected.args };

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  const downloadButton = canvas.getByTestId('download-button');
  await userEvent.click(downloadButton);
  expect(args.onDownloadButtonClick).toBeCalled();
};

import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import React from 'react';
import LinkedAsset from './LinkedAsset';

type Props = React.ComponentProps<typeof LinkedAsset>;

export default {
  component: LinkedAsset,
  title: 'Components/File View Page/Linked Asset',
  argTypes: {
    onAssetClick: { action: 'Clicked on the asset' },
    onTimeSeriesClick: { action: 'Toggled the Time Series' },
    onPAndIDClick: { action: 'Clicked on the P&ID for asset' },
  },
} as Meta;

const Template: Story<Props> = (args) => <LinkedAsset {...args} />;

export const Default = Template.bind({});

Default.args = {
  asset: {
    id: 12345,
    name: 'Asset Name with very loooong to test',
    description: 'Very long description to test the limits of the component',
    isExact: false,
    totalTimeSeries: 100,
    hasDocuments: true,
  },
  highlight: 'lo',
  timeseries: Array(5)
    .fill(1)
    .map((_e, index) => ({
      id: index,
      externalId: `timeseries${index}`,
      name: `Timeseries ${index}`,
      description: 'Test for a time series with a very long description',
      checked: false,
      isStep: false,
      sparkline: {
        loading: false,
        startDate: dayjs('1989-12-22T00:00:00Z').toDate(),
        endDate: dayjs('1989-12-22T00:00:00Z').subtract(-99, 'minute').toDate(),
        datapoints: Array(100)
          .fill(1)
          .map((_v, i) => ({
            timestamp: dayjs('1989-12-22T00:00:00Z').add(i, 'minute').toDate(),
            average: i % 10,
            min: (i % 10) / 2,
            max: (i % 10) * 2,
          })),
      },
    })),
};

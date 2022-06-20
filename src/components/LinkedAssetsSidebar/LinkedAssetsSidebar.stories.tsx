import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import React from 'react';
import LinkedAssetsSidebar from './LinkedAssetsSidebar';

type Props = React.ComponentProps<typeof LinkedAssetsSidebar>;

export default {
  component: LinkedAssetsSidebar,
  title: 'Components/File View Page/Linked Assets Sidebar',
  argTypes: {
    onClose: { action: 'Clicked to close the sidebar' },
    onAssetClick: { action: 'Clicked on the asset' },
    onTimeSeriesClick: { action: 'Toggled the Time Series' },
    onPAndIDClick: { action: 'Clicked on the P&ID for asset' },
  },
} as Meta;

const Template: Story<Props> = (args) => (
  <div style={{ width: '100%', height: 'calc(100vh - 2rem)' }}>
    <LinkedAssetsSidebar {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  assets: Array(4)
    .fill(1)
    .map((_elem, assetIndex) => ({
      asset: {
        id: assetIndex,
        name: 'Asset Name with very loooong to test',
        description:
          'Very long description to test the limits of the component',
        isExact: false,
        totalTimeSeries: 100,
        hasDocuments: true,
      },
      loading: false,
      loadingTimeseries: false,
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
            endDate: dayjs('1989-12-22T00:00:00Z')
              .subtract(-99, 'minute')
              .toDate(),
            datapoints: Array(100)
              .fill(1)
              .map((_v, i) => ({
                timestamp: dayjs('1989-12-22T00:00:00Z')
                  .add(i, 'minute')
                  .toDate(),
                average: i % 10,
                min: (i % 10) / 2,
                max: (i % 10) * 2,
              })),
          },
        })),
    })),
};

import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { MockDatapoints } from '__mocks/datapoints';
import { Timeseries } from '@cognite/sdk';
import { CdfClient } from 'utils';

import TimeSeriesRow, { TimeSeriesRowProps } from './TimeSeriesRow';
import { RowWrapper } from './RowWrapper';

const meta: Meta<TimeSeriesRowProps> = {
  title: 'Time Series / Row',
  component: TimeSeriesRow,
  argTypes: {
    timeSeries: {
      name: 'Time Series',
      defaultValue: {
        id: 1,
        name: 'TimeSeries',
        description: 'Time Series Description',
        unit: 'M3',
      } as Timeseries,
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<TimeSeriesRowProps> = (args) => (
  <RowWrapper>
    <TimeSeriesRow {...args} />
    <TimeSeriesRow {...args} />
    <TimeSeriesRow {...args} />
    <TimeSeriesRow {...args} />
  </RowWrapper>
);

export const NormalRow = Template.bind({});
NormalRow.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.datapoints.retrieve = () => {
      return Promise.resolve([MockDatapoints.datapoint(50)]);
    };
    client.cogniteClient.datapoints.retrieveLatest = () => {
      return Promise.resolve([MockDatapoints.datapoint(50)]);
    };
    return client;
  },
});

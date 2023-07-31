/* eslint-disable no-promise-executor-return */
import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { CdfClient } from 'utils';
import { MockDatapoints } from '__mocks/datapoints';
import { Timeseries } from '@cognite/sdk';
import { MockTimeSeries } from '__mocks/timeseries';
import sinon from 'sinon';

import TimeSeriesCard, { TimeSeriesCardProps } from './TimeSeriesCard';

const meta: Meta<TimeSeriesCardProps> = {
  title: 'Cards / TimeSeries Card',
  component: TimeSeriesCard,
  // argTypes: {
  //   timeSeries: {
  //     name: 'Time Series',
  //     defaultValue: {
  //       id: 1,
  //       name: 'LOR_KARLSTAD_WELL_05_Well_ASSOC_GAS_CAPACITY',
  //       description: 'Some description',
  //       unit: 'M3',
  //       metadata: {
  //         product_type: 'ASSOC_GAS',
  //         ValueType: 'IPSC',
  //         SourceFrequency: 'PerMonth',
  //         SourceAggregationModel: 'DailyAverage',
  //       },
  //     } as unknown as Timeseries,
  //     control: {
  //       type: 'object',
  //     },
  //   },
  // },
};

export default meta;

const mockList = () => {
  const stub = sinon.stub();
  stub.callsFake(() => {
    return Promise.resolve({ items: MockTimeSeries.multiple(5) });
  });
  return stub;
};

const Template: ExtendedStory<TimeSeriesCardProps> = (args) => (
  <TimeSeriesCard {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.timeseries.list = mockList();
    client.cogniteClient.datapoints.retrieve = () => {
      return Promise.resolve([MockDatapoints.datapoint(50)]);
    };
    client.cogniteClient.datapoints.retrieveLatest = () => {
      return Promise.resolve([MockDatapoints.datapoint(50)]);
    };
    return client;
  },
});

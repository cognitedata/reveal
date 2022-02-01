import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { CdfClient } from 'utils';
import sinon from 'sinon';
import { MockTimeSeries } from '__mocks/timeseries';
import { MockDatapoints } from '__mocks/datapoints';

import TimeSeriesTab, { TimeSeriesTabProps } from './TimeSeriesTab';

const meta: Meta<TimeSeriesTabProps> = {
  title: 'Time Series / Time Series Tab',
  component: TimeSeriesTab,
  argTypes: {
    assetId: {
      name: 'Asset ID',
      defaultValue: 1,
    },
  },
};

export default meta;

const mockSearch = () => {
  const stub = sinon.stub();
  stub.callsFake((args) => {
    if (args.search?.name) {
      return Promise.resolve(MockTimeSeries.multiple(4));
    }
    return Promise.resolve(MockTimeSeries.multiple(8));
  });
  return stub;
};

const mockDatapointsRetrieve = () => {
  return Promise.resolve([
    MockDatapoints.datapoint(Math.round(Math.random() * 10 + 10)),
  ]);
};

const Template: ExtendedStory<TimeSeriesTabProps> = (args) => (
  <TimeSeriesTab {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.datapoints.retrieve = mockDatapointsRetrieve;
    client.cogniteClient.datapoints.retrieveLatest = mockDatapointsRetrieve;
    client.cogniteClient.timeseries.search = mockSearch();
    return client;
  },
});

export const Loading = Template.bind({});
Loading.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.datapoints.retrieve = mockDatapointsRetrieve;
    client.cogniteClient.datapoints.retrieveLatest = mockDatapointsRetrieve;
    client.cogniteClient.timeseries.search = () =>
      new Promise((res) => {
        setTimeout(res, 2000);
      });
    return client;
  },
});

export const NoData = Template.bind({});
NoData.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.datapoints.retrieve = mockDatapointsRetrieve;
    client.cogniteClient.datapoints.retrieveLatest = mockDatapointsRetrieve;
    client.cogniteClient.timeseries.search = () => Promise.resolve([]);
    return client;
  },
});

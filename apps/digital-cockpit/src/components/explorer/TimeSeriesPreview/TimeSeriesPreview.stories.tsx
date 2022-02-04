import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';
import { Timeseries } from '@cognite/sdk';
import { CdfClient } from 'utils';
import { MockDatapoints } from '__mocks/datapoints';

import TimeSeriesPreview, { TimeSeriesPreviewProps } from './TimeSeriesPreview';

const meta: Meta<TimeSeriesPreviewProps> = {
  title: 'Time Series / Preview',
  component: TimeSeriesPreview,
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
    showYAxis: {
      name: 'Show Y Axis',
      defaultValue: false,
      control: {
        type: 'boolean',
      },
    },
  },
};

export default meta;

const SimpleTemplate: ExtendedStory<TimeSeriesPreviewProps> = (args) => (
  <div>
    <div style={{ width: 100, height: 50 }}>
      <TimeSeriesPreview {...args} />
    </div>
    <div style={{ width: 300, height: 200 }}>
      <TimeSeriesPreview {...args} />
    </div>
    <div style={{ width: 600, height: 200 }}>
      <TimeSeriesPreview {...args} />
    </div>
  </div>
);

const YAxisTemplate: ExtendedStory<TimeSeriesPreviewProps> = (args) => (
  <div>
    <div style={{ width: 300, height: 150 }}>
      <TimeSeriesPreview {...args} />
    </div>
    <div style={{ width: 600, height: 200 }}>
      <TimeSeriesPreview {...args} />
    </div>
  </div>
);

export const Standard = SimpleTemplate.bind({});
Standard.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.datapoints.retrieve = () => {
      return Promise.resolve([MockDatapoints.datapoint(10)]);
    };
    return client;
  },
});

export const WithYAxis = YAxisTemplate.bind({});
WithYAxis.args = { showYAxis: true };
WithYAxis.story = configureStory({
  mockCdfClient: (client: CdfClient) => {
    client.cogniteClient.datapoints.retrieve = () => {
      return Promise.resolve([MockDatapoints.datapoint(10)]);
    };
    return client;
  },
});

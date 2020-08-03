import React from 'react';
import { mount } from 'enzyme';
import { GetTimeSeriesMetadataDTO } from '@cognite/sdk';
import { ClientSDKProvider } from '@cognite/gearbox';
import { TimeseriesDetailsAbstract } from './TimeseriesDetailsAbstract';

const timeseries: GetTimeSeriesMetadataDTO = {
  name: 'Hello',
  description: 'Hello',
  id: 123,
  isStep: false,
  isString: false,
  lastUpdatedTime: new Date(),
  createdTime: new Date(),
};

const sdk = {
  timeseries: {
    list: jest.fn().mockResolvedValue({ items: [timeseries] }),
    retrieve: jest.fn().mockResolvedValue([timeseries]),
    aggregate: jest.fn().mockResolvedValue({ items: [timeseries] }),
    search: jest.fn().mockResolvedValue({ items: [timeseries] }),
  },
  datapoints: {
    retrieve: jest
      .fn()
      .mockResolvedValue([{ datapoints: [], isString: false }]),
  },
};

// (await sdk.datapoints.retrieve({})).

describe('TimeseriesDetailsAbstract', () => {
  it('render normally', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <TimeseriesDetailsAbstract timeSeries={timeseries} />
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(timeseries.name);
  });
});

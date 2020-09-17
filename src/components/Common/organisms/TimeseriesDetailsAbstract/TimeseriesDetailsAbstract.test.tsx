import React from 'react';
import { mount } from 'enzyme';
import { Timeseries } from 'cognite-sdk-v3';
import { ClientSDKProvider } from '@cognite/gearbox';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { TimeseriesDetailsAbstract } from './TimeseriesDetailsAbstract';

jest.mock('utils/SDK');

const timeseries: Timeseries = {
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

describe('TimeseriesDetailsAbstract', () => {
  it('render normally', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <ResourceSelectionProvider>
          <TimeseriesDetailsAbstract timeSeries={timeseries} />
        </ResourceSelectionProvider>
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(timeseries.name);
  });
});

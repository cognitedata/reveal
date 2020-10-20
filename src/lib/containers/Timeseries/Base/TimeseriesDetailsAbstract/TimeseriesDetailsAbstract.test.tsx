import React from 'react';
import { mount } from 'enzyme';
import { Timeseries } from '@cognite/sdk';
import { ClientSDKProvider } from '@cognite/gearbox';
import { ResourceSelectionProvider } from 'lib/context/ResourceSelectionContext';
import { SDKProvider } from 'lib/context/sdk';
import { TimeseriesDetailsAbstract } from './TimeseriesDetailsAbstract';

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
      <SDKProvider sdk={sdk}>
        <ClientSDKProvider client={sdk}>
          <ResourceSelectionProvider>
            <TimeseriesDetailsAbstract timeSeries={timeseries} />
          </ResourceSelectionProvider>
        </ClientSDKProvider>
      </SDKProvider>
    );

    expect(container.text()).toContain(timeseries.name);
  });
});

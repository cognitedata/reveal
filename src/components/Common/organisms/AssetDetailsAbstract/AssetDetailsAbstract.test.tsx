import React from 'react';
import { mount } from 'enzyme';
import { Asset } from '@cognite/sdk';
import { ClientSDKProvider } from '@cognite/gearbox';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { AssetDetailsAbstract } from './AssetDetailsAbstract';

const asset: Asset = {
  id: 5927592366707648,
  rootId: 5927592366707648,
  createdTime: new Date(1580503121335),
  lastUpdatedTime: new Date(1580503121335),
  name: '001wdtQD',
  metadata: {
    someAttribute: 'Some value',
    someOtherAttribute: 'Some other value',
  },
};

const files = [
  {
    name: 'Hello',
    id: 123,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    name: 'Hello2',
    id: 1234,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
];

const ts = [
  {
    name: 'Whaoopoo',
    id: 123,
    isString: false,
    isStep: false,
    description: 'asdfasdfdas',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
];

const sdk = {
  assets: {
    list: jest.fn().mockResolvedValue({ items: [asset] }),
    retrieve: jest.fn().mockResolvedValue([asset]),
  },
};

jest.mock('components/Common', () => {
  const Gearbox = jest.requireActual('components/Common');
  return { ...Gearbox, AssetBreadcrumb: () => <p>Mocked</p> };
});

describe('AssetDetailsAbstract', () => {
  it('render normally', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <ResourceSelectionProvider>
          <AssetDetailsAbstract asset={asset} />
        </ResourceSelectionProvider>
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(asset.name);
    expect(container.text()).toContain('Mocked');
  });
  it('render normally with files and timeseries', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <ResourceSelectionProvider>
          <AssetDetailsAbstract asset={asset} files={files} timeseries={ts} />
        </ResourceSelectionProvider>
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(asset.name);
    expect(container.text()).toContain('P&IDs2');
    expect(container.text()).toContain('Time series1');
  });
});

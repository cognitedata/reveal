import React from 'react';
import { mount } from 'enzyme';
import { Asset } from '@cognite/sdk';
import { ClientSDKProvider } from '@cognite/gearbox';
import { Button } from '@cognite/cogs.js';
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

jest.mock('@cognite/gearbox', () => {
  const Gearbox = jest.requireActual('@cognite/gearbox');
  return { ...Gearbox, AssetBreadcrumb: () => <p>Mocked</p> };
});

describe('AssetDetailsAbstract', () => {
  it('render normally', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <AssetDetailsAbstract asset={asset} />
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(asset.name);
    expect(container.text()).toContain('Mocked');
  });
  it('render normally with files and timeseries', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <AssetDetailsAbstract asset={asset} files={files} timeseries={ts} />
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(asset.name);
    expect(container.text()).toContain('P&IDs2');
    expect(container.text()).toContain('Time Series1');
  });
  it('render files and timeseries', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <AssetDetailsAbstract asset={asset} files={files} timeseries={ts} />
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(asset.name);
    container.find('div#pnids').simulate('click');
    expect(container.text()).toContain(files[0].name);
    container.find(Button).simulate('click');
    container.find('div#timeseries').simulate('click');
    expect(container.text()).toContain(ts[0].name);
  });
  it('custom render files and timeseries', () => {
    const container = mount(
      <ClientSDKProvider client={sdk}>
        <AssetDetailsAbstract
          asset={asset}
          files={files}
          timeseries={ts}
          timeseriesPreview={newTs => <p key={newTs.id}>custom</p>}
          filePreview={newTs => <p key={newTs.id}>wow a file</p>}
        />
      </ClientSDKProvider>
    );

    expect(container.text()).toContain(asset.name);
    container.find('div#pnids').simulate('click');
    expect(container.text()).toContain('wow a file');
    container.find(Button).simulate('click');
    container.find('div#timeseries').simulate('click');
    expect(container.text()).toContain('custom');
    container.find(Button).simulate('click');
    expect(container.text()).toContain(asset.name);
  });
});

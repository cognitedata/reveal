import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { TimeseriesDetailsAbstract } from 'lib';
import { ResourceSelectionProvider, SDKProvider } from 'lib/context';
import { assets } from 'stubs/assets';
import { files } from 'stubs/files';
import { timeseries } from 'stubs/timeseries';
import { AssetDetailsAbstract } from './AssetDetailsAbstract';

export default {
  title: 'Assets/Base/AssetDetailsAbstract',
  component: AssetDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <AssetDetailsAbstract
      asset={assets[0]}
      files={files}
      timeseries={timeseries}
    />
  );
};

export const WithActions = () => {
  return (
    <AssetDetailsAbstract
      asset={assets[0]}
      files={[files[0]]}
      timeseries={timeseries}
      actions={[
        <Button type="primary">Click me</Button>,
        <Button>Click me too</Button>,
      ]}
      timeseriesPreview={ts => (
        <TimeseriesDetailsAbstract
          timeSeries={ts}
          actions={[
            <Button key="view" type="primary" icon="ArrowRight">
              View details
            </Button>,
          ]}
        />
      )}
    >
      <Button>Hover me!</Button>
    </AssetDetailsAbstract>
  );
};
export const WithExtras = () => {
  return (
    <AssetDetailsAbstract
      asset={assets[0]}
      files={[files[0]]}
      timeseries={timeseries}
      extras={
        <Button
          type="primary"
          variant="ghost"
          shape="round"
          icon="VerticalEllipsis"
        />
      }
      timeseriesPreview={ts => (
        <TimeseriesDetailsAbstract
          timeSeries={ts}
          actions={[
            <Button key="view" type="primary" icon="ArrowRight">
              View details
            </Button>,
          ]}
        />
      )}
    >
      <Button>Hover me!</Button>
    </AssetDetailsAbstract>
  );
};

const sdkMock = {
  post: async (query: string) => {
    if (query.includes('assets')) {
      return { data: { items: [assets[0]] } };
    }
    return { data: { items: [] } };
  },
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <SDKProvider sdk={sdkMock}>
      <ResourceSelectionProvider
        resourcesState={[{ id: assets[0].id, state: 'active', type: 'assets' }]}
      >
        <Wrapper>{children}</Wrapper>
      </ResourceSelectionProvider>
    </SDKProvider>
  );
};

const Wrapper = styled.div`
  padding: 20px;
  width: 400px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;

  && > * {
    background: #fff;
  }
`;

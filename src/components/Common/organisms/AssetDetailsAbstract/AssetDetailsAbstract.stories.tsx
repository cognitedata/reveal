import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import '@cognite/cogs.js/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';
import { Asset } from 'cognite-sdk-v3';
import { TimeseriesDetailsAbstract } from 'components/Common';
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
    name: 'Hello.pdf',
    id: 123,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    mimeType: 'application/pdf',
  },
  {
    name: 'Hello.pdf',
    id: 123,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    mimeType: 'application/pdf',
  },
  {
    name: 'Hello.pdf',
    id: 123,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    mimeType: 'application/pdf',
  },
  {
    name: 'Hello.pdf',
    id: 123,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    mimeType: 'application/pdf',
  },
  {
    name: 'Hello.pdf',
    id: 123,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    mimeType: 'application/pdf',
  },
  {
    name: 'Hello.pdf',
    id: 123,
    uploaded: false,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    mimeType: 'application/pdf',
  },
];

const timeseries = [
  {
    name: 'Hello',
    id: 123,
    isString: false,
    isStep: false,
    description: 'asdfasdfdas',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
];

export default {
  title: 'Organisms/AssetDetailsAbstract',
  component: AssetDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <AssetDetailsAbstract asset={asset} files={files} timeseries={timeseries} />
  );
};

export const WithActions = () => {
  return (
    <AssetDetailsAbstract
      asset={asset}
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
      asset={asset}
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

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResourceSelectionProvider
      resourcesState={[{ id: asset.id, state: 'active', type: 'assets' }]}
    >
      <Wrapper>{children}</Wrapper>
    </ResourceSelectionProvider>
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

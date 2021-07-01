import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
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

export default { title: 'Organisms/AssetDetailsAbstract' };

export const Example = () => {
  return (
    <Container>
      <AssetDetailsAbstract
        asset={asset}
        files={[
          {
            name: 'Hello',
            id: 123,
            uploaded: false,
            lastUpdatedTime: new Date(),
            createdTime: new Date(),
          },
        ]}
      />
    </Container>
  );
};

export const WithActions = () => {
  return (
    <Container>
      <AssetDetailsAbstract
        asset={asset}
        files={[
          {
            name: 'Hello',
            id: 123,
            uploaded: false,
            lastUpdatedTime: new Date(),
            createdTime: new Date(),
          },
        ]}
        actions={[
          <Button type="primary">Click me</Button>,
          <Button>Click me too</Button>,
        ]}
      >
        <Button>Hover me!</Button>
      </AssetDetailsAbstract>
    </Container>
  );
};
export const WithExtras = () => {
  return (
    <Container>
      <AssetDetailsAbstract
        asset={asset}
        files={[
          {
            name: 'Hello',
            id: 123,
            uploaded: false,
            lastUpdatedTime: new Date(),
            createdTime: new Date(),
          },
        ]}
        extras={
          <Button
            type="primary"
            variant="ghost"
            shape="round"
            icon="VerticalEllipsis"
          />
        }
      >
        <Button>Hover me!</Button>
      </AssetDetailsAbstract>
    </Container>
  );
};

const Container = styled.div`
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

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  ResourceSelectionProvider,
  ResourceItemState,
} from 'context/ResourceSelectionContext';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { SDKProvider } from 'context/sdk';
import { AssetTreeTable } from './AssetTreeTable';
import { assets } from '../AssetTable/assets';

export default {
  title: 'Molecules/AssetTreeTable',
  component: AssetTreeTable,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
};

export const Example = () => {
  return (
    <AssetTreeTable
      filter={{}}
      onAssetClicked={action('onAssetClicked')}
      query={text('query', '')}
    />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <ResourceSelectionProvider mode="single">
      <AssetTreeTable
        filter={{}}
        onAssetClicked={action('onAssetClicked')}
        query={text('query', '')}
      />
    </ResourceSelectionProvider>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const sdk = { post: async (..._props) => ({ data: { items: assets } }) };
  const [selection, setSelection] = useState<ResourceItemState[]>([
    { id: 1635401930580505, type: 'asset', state: 'selected' },
  ]);

  const onSelect = newItem => {
    const index = selection.findIndex(
      el => el.id === newItem.id && el.type === newItem.type
    );
    if (index !== -1) {
      setSelection(
        selection.slice(0, index).concat(selection.slice(index + 1))
      );
    } else {
      setSelection(selection.concat([{ ...newItem, state: 'selected' }]));
    }
  };
  return (
    <SDKProvider sdk={sdk}>
      <ResourceSelectionProvider
        mode="none"
        resourcesState={selection}
        onSelect={onSelect}
      >
        <Container>{children}</Container>
      </ResourceSelectionProvider>
    </SDKProvider>
  );
};

const Container = styled.div`
  padding: 20px;
  width: 100%;
  height: 600px;
  background: grey;
  display: flex;
  position: relative;

  && > * {
    background: #fff;
  }
`;

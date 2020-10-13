import React, { useState } from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { SDKProvider } from 'context/sdk';
import { Asset } from '@cognite/sdk';
import { AssetSelect } from './AssetSelect';
import { assets } from '../AssetTable/assets';

export default {
  title: 'Molecules/AssetSelect',
  component: AssetSelect,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
};

export const Example = () => {
  const [selected, setSelected] = useState<Asset | undefined>(undefined);
  return (
    <AssetSelect
      selectedAssetIds={selected ? [selected?.id] : []}
      onAssetSelected={item => {
        setSelected(item ? item[0] : undefined);
        action('onAssetSelected')(item);
      }}
    />
  );
};
export const ExampleMulti = () => {
  const [selected, setSelected] = useState<Asset[]>([]);
  return (
    <AssetSelect
      isMulti
      selectedAssetIds={selected.map(el => el.id)}
      onAssetSelected={item => {
        setSelected(item);
        action('onAssetSelected')(item);
      }}
    />
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const sdk = {
    post: async (url, ..._props) => {
      if (url.includes('ids')) {
        return { data: { items: [assets[0]] } };
      }
      return { data: { items: assets } };
    },
  };
  return (
    <SDKProvider sdk={sdk}>
      <Container>{children}</Container>
    </SDKProvider>
  );
};

const Container = styled.div`
  padding: 20px;
  background: grey;
  display: flex;
  position: relative;
`;

import React, { useState } from 'react';
import styled from 'styled-components';
import { CogniteResourceProvider } from '@cognite/cdf-resources-store';
import { mockStore } from 'utils/mockStore';
import { Map } from 'immutable';
import {
  ResourceSelectionProvider,
  ResourceItemState,
} from 'context/ResourceSelectionContext';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { AssetTable } from './AssetTable';
import { assets } from './assets';

export default {
  title: 'Molecules/AssetTable',
  component: AssetTable,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
};

export const Example = () => {
  return (
    <AssetTable
      assets={assets}
      onAssetClicked={action('onAssetClicked')}
      query={text('query', '')}
    />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <ResourceSelectionProvider mode="single">
      <AssetTable
        assets={assets}
        onAssetClicked={action('onAssetClicked')}
        query={text('query', '')}
      />
    </ResourceSelectionProvider>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
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
    <ResourceSelectionProvider
      mode="none"
      resourcesState={selection}
      onSelect={onSelect}
    >
      <CogniteResourceProvider
        store={mockStore({
          assets: {
            items: {
              items: Map([
                [
                  4617285525372246,
                  {
                    name: 'ROOT',
                    description: '',
                    source: '',
                    id: 4617285525372246,
                    createdTime: new Date(1581956002278),
                    lastUpdatedTime: new Date(1581956002278),
                    rootId: 4617285525372246,
                  },
                ],
              ]),
            },
          },
        })}
      >
        <Container>{children}</Container>
      </CogniteResourceProvider>
    </ResourceSelectionProvider>
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

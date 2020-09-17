import React, { useState } from 'react';
import styled from 'styled-components';
import { CogniteResourceProvider } from '@cognite/cdf-resources-store';
import { mockStore } from 'utils/mockStore';
import { Map } from 'immutable';
import {
  ResourceSelectionProvider,
  ResourceItemState,
} from 'context/ResourceSelectionContext';
import { AssetTable } from './AssetTable';
import { assets } from './assets';

export default { title: 'Molecules/AssetTable' };

export const Example = () => {
  return (
    <ResourceSelectionProvider mode="none">
      <Wrapper>
        <AssetTable assets={assets} onAssetClicked={() => {}} />
      </Wrapper>
    </ResourceSelectionProvider>
  );
};
export const ExampleSingleSelect = () => {
  return (
    <Wrapper>
      <AssetTable assets={assets} onAssetClicked={() => {}} />
    </Wrapper>
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
      mode="single"
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

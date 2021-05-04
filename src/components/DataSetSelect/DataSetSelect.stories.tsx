import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { SDKProvider } from '@cognite/sdk-provider';
import { sdkMock } from 'docs/stub';
import { DataSetSelect } from './DataSetSelect';

export default {
  title: 'Component/DataSetSelect',
  component: DataSetSelect,
  decorators: [
    (storyFn: any) => (
      <Container>
        <SDKProvider sdk={sdkMock}>{storyFn()}</SDKProvider>
      </Container>
    ),
  ],
};

export const Example = () => (
  <DataSetSelect
    onSelectionChange={action('onSelectionChange')}
    style={{ minWidth: '306px', maxHeight: '36px' }}
    multiple
    selectedDataSetIds={[]}
  />
);

export const SingleSelection = () => (
  <DataSetSelect
    onSelectionChange={action('onSelectionChange')}
    style={{ minWidth: '306px', maxHeight: '36px' }}
    multiple={false}
    selectedDataSetIds={[]}
    allowClear
  />
);

const Container = styled.div`
  padding: 20px;
  display: flex;
`;

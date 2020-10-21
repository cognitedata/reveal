import React from 'react';
import { text } from '@storybook/addon-knobs';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { FileFilterGridTable } from './FileGridTable';

export default {
  title: 'Files/FileFilterGridTable',
  component: FileFilterGridTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <FileFilterGridTable
    query={text('query', '')}
    onRowClick={action('onRowClick')}
  />
);

const Container = styled.div`
  height: 400px;
`;

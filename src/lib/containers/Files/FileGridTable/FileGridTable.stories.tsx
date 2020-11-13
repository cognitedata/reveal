import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { files } from 'stubs/files';
import { FileGridTable } from './FileGridTable';

export default {
  title: 'Files/FileGridTable',
  component: FileGridTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <FileGridTable items={files} onItemClicked={action('onItemClicked')} />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <FileGridTable
      selectionMode="single"
      items={files}
      onItemClicked={action('onItemClicked')}
    />
  );
};

const Container = styled.div`
  height: 600px;
`;

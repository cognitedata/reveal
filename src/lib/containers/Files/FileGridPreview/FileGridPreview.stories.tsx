import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { files } from 'stubs/files';
import { FileGridPreview } from './FileGridPreview';

export default {
  title: 'Files/FileGridPreview',
  component: FileGridPreview,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <FileGridPreview items={files} onItemClicked={action('onItemClicked')} />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <FileGridPreview
      selectionMode="single"
      item={files[0]}
      onItemClicked={action('onItemClicked')}
    />
  );
};

const Container = styled.div`
  height: 600px;
`;

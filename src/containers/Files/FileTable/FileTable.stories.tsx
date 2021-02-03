import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { files } from 'stubs/files';
import { FileTable } from './FileTable';

export default {
  title: 'Files/FileTable',
  component: FileTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <FileTable
      items={files}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};

export const ExampleSingleSelect = () => {
  return (
    <FileTable
      selectionMode="single"
      items={files}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};

const Container = styled.div`
  height: 600px;
`;

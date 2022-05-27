import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { files } from '../../../stubs/files';
import { FileTable } from './FileTable';

export default {
  title: 'Files/FileTable',
  component: FileTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example = args => <FileTable {...args} />;
Example.args = {
  items: files,
  onItemClicked: action('onItemClicked'),
};

export const ExampleSingleSelect = args => <FileTable {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  items: files,
  onItemClicked: action('onItemClicked'),
};

const Container = styled.div`
  height: 600px;
`;

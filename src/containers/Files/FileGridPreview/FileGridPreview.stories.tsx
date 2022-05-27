import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { files } from '../../../stubs/files';
import { FileGridPreview } from './FileGridPreview';

export default {
  title: 'Files/FileGridPreview',
  component: FileGridPreview,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text', defaultValue: '' } },
};

export const Example = args => <FileGridPreview {...args} />;
Example.args = {
  item: files[0],
  onItemClicked: action('onItemClicked'),
  isSelected: () => {},
};

export const ExampleSingleSelect = args => <FileGridPreview {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  item: files[0],
  onItemClicked: action('onItemClicked'),
  isSelected: () => {},
};

const Container = styled.div`
  height: 600px;
`;

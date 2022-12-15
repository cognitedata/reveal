import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { files } from 'stubs/files';
import { ComponentStory } from '@storybook/react';
import { FileGridPreview } from './FileGridPreview';

export default {
  title: 'Files/FileGridPreview',
  component: FileGridPreview,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text', defaultValue: '' } },
};

export const Example: ComponentStory<typeof FileGridPreview> = args => (
  <FileGridPreview {...args} />
);
Example.args = {
  item: files[0],
  onClick: action('onClick'),
  isSelected: () => false,
};

export const ExampleSingleSelect: ComponentStory<
  typeof FileGridPreview
> = args => <FileGridPreview {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  item: files[0],
  onClick: action('onClick'),
  isSelected: () => false,
};

const Container = styled.div`
  height: 600px;
`;

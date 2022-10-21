import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { files } from 'stubs/files';
import { ComponentStory } from '@storybook/react';
import { FileNewTable } from './FileNewTable';

export default {
  title: 'Files/FileNewTable',
  component: FileNewTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof FileNewTable> = args => (
  <FileNewTable {...args} />
);
Example.args = {
  data: files,
  onRowClick: action('onRowClicked'),
};

const Container = styled.div`
  height: 600px;
`;

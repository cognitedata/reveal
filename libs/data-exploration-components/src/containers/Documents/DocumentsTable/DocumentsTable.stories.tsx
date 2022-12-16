import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';
import { DocumentsTable } from './DocumentsTable';
import { documents } from '@data-exploration-components/stubs/documents';

export default {
  title: 'Documents/DocumentsTable',
  component: DocumentsTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof DocumentsTable> = (args) => (
  <DocumentsTable {...args} />
);

Example.args = {
  data: documents,
  onRowClick: action('onRowClicked'),
};

const Container = styled.div`
  height: 600px;
`;

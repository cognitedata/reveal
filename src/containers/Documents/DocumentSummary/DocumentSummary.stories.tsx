import React from 'react';
import styled from 'styled-components';
import { ComponentStory } from '@storybook/react';
import { DocumentSummary } from './DocumentSummary';

export default {
  title: 'Documents/DocumentSummary',
  component: DocumentSummary,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof DocumentSummary> = args => (
  <DocumentSummary {...args} />
);

const Container = styled.div`
  height: 600px;
`;

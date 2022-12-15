import { ComponentStory } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { DocumentSearchResults } from './DocumentSearchResults';

export default {
  title: 'Search Results/DocumentSearchResults',
  component: DocumentSearchResults,
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof DocumentSearchResults> = args => {
  return (
    <Container>
      <DocumentSearchResults {...args} />
    </Container>
  );
};

// Example.args = {
//   showCount: true,
// };

const Container = styled.div`
  height: 400px;
`;

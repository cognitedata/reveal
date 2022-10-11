import { ComponentStory } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';
import { EmptyState } from './EmptyState';

export default {
  title: 'Component/EmptyState',
  component: EmptyState,
};

export const Example: ComponentStory<typeof EmptyState> = args => {
  return (
    <Container>
      <EmptyState {...args} />
    </Container>
  );
};

Example.args = {
  body: 'Please, refine your filters',
};

const Container = styled.div`
  height: 100%;
`;

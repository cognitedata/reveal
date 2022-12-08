import React from 'react';
import styled from 'styled-components';
import { ComponentStory } from '@storybook/react';
import { FileSummary } from './FileSummary';

export default {
  title: 'Files/FileSummary',
  component: FileSummary,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof FileSummary> = args => (
  <FileSummary {...args} />
);

const Container = styled.div`
  height: 600px;
`;

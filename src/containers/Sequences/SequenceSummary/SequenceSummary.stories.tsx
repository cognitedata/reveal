import React from 'react';
import styled from 'styled-components';
import { ComponentStory } from '@storybook/react';
import { SequenceSummary } from './index';

export default {
  title: 'Sequences/SequenceSummary',
  component: SequenceSummary,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof SequenceSummary> = args => (
  <SequenceSummary {...args} />
);

const Container = styled.div`
  height: 600px;
`;

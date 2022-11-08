import React from 'react';
import styled from 'styled-components';
import { ComponentStory } from '@storybook/react';
import { TimeseriesSummary } from './TimeseriesSummary';

export default {
  title: 'Time Series/TimseriesSummary',
  component: TimeseriesSummary,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof TimeseriesSummary> = args => (
  <TimeseriesSummary {...args} />
);

const Container = styled.div`
  height: 600px;
`;

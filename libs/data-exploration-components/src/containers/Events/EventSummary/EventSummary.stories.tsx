import React from 'react';
import styled from 'styled-components';
import { ComponentStory } from '@storybook/react';
import { EventSummary } from './EventSummary';

export default {
  title: 'Events/EventSummary',
  component: EventSummary,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof EventSummary> = args => (
  <EventSummary {...args} />
);

const Container = styled.div`
  height: 600px;
`;

import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { events } from 'stubs/events';
import { ComponentStory } from '@storybook/react';
import { EventTable } from './EventTable';

export default {
  title: 'Events/EventTable',
  component: EventTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof EventTable> = args => (
  <EventTable {...args} />
);
Example.args = {
  items: events,
  onItemClicked: action('onItemClicked'),
};

export const ExampleSingleSelect: ComponentStory<typeof EventTable> = args => (
  <EventTable {...args} />
);
ExampleSingleSelect.args = {
  selectionMode: 'single',
  items: events,
  onItemClicked: action('onItemClicked'),
};

const Container = styled.div`
  height: 600px;
`;

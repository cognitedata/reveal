import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { events } from 'stubs/events';
import { ComponentStory } from '@storybook/react';
import { EventNewTable } from './EventNewTable';

export default {
  title: 'Events/EventNewTable',
  component: EventNewTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof EventNewTable> = args => (
  <EventNewTable {...args} />
);
Example.args = {
  data: events,
  onRowClick: action('onRowClicked'),
};

const Container = styled.div`
  height: 600px;
`;

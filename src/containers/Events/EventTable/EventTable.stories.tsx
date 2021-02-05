import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { events } from 'stubs/events';
import { EventTable } from './EventTable';

export default {
  title: 'Events/EventTable',
  component: EventTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <EventTable
      items={events}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <EventTable
      selectionMode="single"
      items={events}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};
const Container = styled.div`
  height: 600px;
`;

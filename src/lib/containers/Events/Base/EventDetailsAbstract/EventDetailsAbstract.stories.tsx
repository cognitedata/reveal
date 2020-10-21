import React from 'react';
import { Button } from '@cognite/cogs.js';
import { events } from 'stubs/events';
import { EventDetailsAbstract } from './EventDetailsAbstract';

export default {
  title: 'Events/Base/EventDetailsAbstract',
  component: EventDetailsAbstract,
};

export const Example = () => {
  return <EventDetailsAbstract event={events[0]} />;
};

export const WithActions = () => {
  return (
    <EventDetailsAbstract
      event={events[0]}
      actions={[
        <Button key="1" type="primary">
          Click me
        </Button>,
        <Button key="2">Click me too</Button>,
      ]}
    />
  );
};
export const WithExtras = () => {
  return (
    <EventDetailsAbstract
      event={events[0]}
      extras={
        <Button
          type="primary"
          variant="ghost"
          shape="round"
          icon="VerticalEllipsis"
        />
      }
    />
  );
};

import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { ResourceSelectionProvider } from 'lib/context';
import { events } from 'stubs/events';
import { EventDetailsAbstract } from './EventDetailsAbstract';

export default {
  title: 'Events/Base/EventDetailsAbstract',
  component: EventDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return <EventDetailsAbstract event={events[0]} />;
};

export const WithActions = () => {
  return (
    <EventDetailsAbstract
      event={events[0]}
      actions={[
        <Button type="primary">Click me</Button>,
        <Button>Click me too</Button>,
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

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResourceSelectionProvider>
      <Wrapper>{children}</Wrapper>
    </ResourceSelectionProvider>
  );
};

const Wrapper = styled.div`
  padding: 20px;
  width: 400px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;

  && > * {
    background: #fff;
  }
`;

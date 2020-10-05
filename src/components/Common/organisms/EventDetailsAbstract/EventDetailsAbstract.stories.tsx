import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import '@cognite/cogs.js/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';
import { CogniteEvent } from '@cognite/sdk';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { EventDetailsAbstract } from './EventDetailsAbstract';

const event = ({
  id: 18829367093500,
  type: 'LubeOil_65-CT-510',
  subtype: '123',
  externalId: 'LubeOil_65-CT-510',
  metadata: {},
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
} as unknown) as CogniteEvent;

export default {
  title: 'Organisms/EventDetailsAbstract',
  component: EventDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return <EventDetailsAbstract event={event} />;
};

export const WithActions = () => {
  return (
    <EventDetailsAbstract
      event={event}
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
      event={event}
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

import React, { useState } from 'react';
import styled from 'styled-components';
import { CogniteResourceProvider } from '@cognite/cdf-resources-store';
import { mockStore } from 'utils/mockStore';
import {
  ResourceSelectionProvider,
  ResourceItemState,
} from 'context/ResourceSelectionContext';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { EventTable } from './EventTable';
import { events } from './events';

export default {
  title: 'Molecules/EventTable',
  component: EventTable,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
};

export const Example = () => {
  return (
    <EventTable
      events={events}
      onEventClicked={action('onEventClicked')}
      query={text('query', '')}
    />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <ResourceSelectionProvider mode="single">
      <EventTable
        events={events}
        onEventClicked={action('onEventClicked')}
        query={text('query', '')}
      />
    </ResourceSelectionProvider>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const [selection, setSelection] = useState<ResourceItemState[]>([
    { id: 1635401930580505, type: 'timeSeries', state: 'selected' },
  ]);

  const onSelect = newItem => {
    const index = selection.findIndex(
      el => el.id === newItem.id && el.type === newItem.type
    );
    if (index !== -1) {
      setSelection(
        selection.slice(0, index).concat(selection.slice(index + 1))
      );
    } else {
      setSelection(selection.concat([{ ...newItem, state: 'selected' }]));
    }
  };
  return (
    <ResourceSelectionProvider
      mode="none"
      resourcesState={selection}
      onSelect={onSelect}
    >
      <CogniteResourceProvider store={mockStore({})}>
        <Container>{children}</Container>
      </CogniteResourceProvider>
    </ResourceSelectionProvider>
  );
};

const Container = styled.div`
  padding: 20px;
  width: 100%;
  height: 600px;
  background: grey;
  display: flex;
  position: relative;

  && > * {
    background: #fff;
  }
`;

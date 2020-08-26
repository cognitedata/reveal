import React, { useState } from 'react';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { mockStore } from 'utils/mockStore';
import {
  ResourceSelectionProvider,
  ResourceItemState,
} from 'context/ResourceSelectionContext';
import { EventTable } from './EventTable';
import { events } from './events';

export default { title: 'Molecules/EventTable' };

export const Example = () => {
  return (
    <ResourceSelectionProvider>
      <Wrapper>
        <EventTable events={events} onEventClicked={() => {}} />
      </Wrapper>
    </ResourceSelectionProvider>
  );
};
export const ExampleSingleSelect = () => {
  return (
    <Wrapper>
      <EventTable events={events} onEventClicked={() => {}} />
    </Wrapper>
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
      mode="single"
      resourcesState={selection}
      onSelect={onSelect}
    >
      <Provider store={mockStore({})}>
        <Container>{children}</Container>
      </Provider>
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

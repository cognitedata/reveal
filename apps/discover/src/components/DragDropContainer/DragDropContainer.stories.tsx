import React, { useState } from 'react';

import times from 'lodash/times';
import styled from 'styled-components/macro';

import { WithDragHandleProps } from '.';
import { DragDropContainer } from './DragDropContainer';

const ItemWrapper = styled.span`
  background: #bfbfbf;
  padding: 8px;
  margin: 8px;
  border-radius: 8px;
  width: 120px;
  text-align: center;
`;

const Item: React.FC<WithDragHandleProps<{ label: string }>> = ({
  label,
  ...dragHandleProps
}) => {
  return <ItemWrapper {...dragHandleProps}>{label}</ItemWrapper>;
};

export const Basic = () => {
  return (
    <DragDropContainer id="drag-drop-container-basic">
      {times(5).map((key) => (
        <Item key={key} label={`Basic Item: ${key}`} />
      ))}
    </DragDropContainer>
  );
};

export const Synchronized = () => {
  const elementKeys = times(5).map(String);

  const [elementsOrder, setElementsOrder] = useState(elementKeys);

  return (
    <div>
      <DragDropContainer
        id="drag-drop-container-synchronized-master"
        onRearranged={setElementsOrder}
      >
        {elementKeys.map((key) => (
          <Item key={key} label={`Master Item: ${key}`} />
        ))}
      </DragDropContainer>

      <DragDropContainer
        id="drag-drop-container-synchronized-slave"
        elementsOrder={elementsOrder}
      >
        {elementKeys.map((key) => (
          <Item key={key} label={`Slave Item: ${key}`} />
        ))}
      </DragDropContainer>
    </div>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / DragDropContainer',
  component: DragDropContainer,
};

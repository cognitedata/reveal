import React, { useState } from 'react';

import times from 'lodash/times';
import styled from 'styled-components/macro';

import { WithDragHandleProps } from '.';
import { DragDropContainer } from './DragDropContainer';
import { DragHandleIcon } from './components/DragHandleIcon';
import { FlexColumn, FlexRow } from 'styles/layout';

const ItemWrapper = styled(FlexRow)`
  align-items: center;
  justify-content: center;
  background: #bfbfbf;
  padding: 8px;
  margin: 8px;
  border-radius: 8px;
  width: 120px;
  .cogs-icon {
    margin-right: 8px;
  }
`;

const Spacer = styled.div`
  height: 50px;
`;

const ScrollContainerHorizontal = styled(FlexColumn)`
  max-width: 400px;
  height: fit-content;
  overflow-x: scroll;
`;

const ScrollContainerVertical = styled(FlexColumn)`
  max-height: 200px;
  width: fit-content;
  overflow-y: scroll;
`;

type ItemProps = { label: string };

const Item: React.FC<WithDragHandleProps<ItemProps>> = ({
  label,
  dragHandleProps,
}) => {
  return <ItemWrapper {...dragHandleProps}>{label}</ItemWrapper>;
};

const ItemHorizontalIcon: React.FC<WithDragHandleProps<ItemProps>> = ({
  label,
  dragHandleProps,
}) => {
  return (
    <ItemWrapper>
      <DragHandleIcon.Horizontal dragHandleProps={dragHandleProps} />
      <span>{label}</span>
    </ItemWrapper>
  );
};

const ItemVerticalIcon: React.FC<WithDragHandleProps<ItemProps>> = ({
  label,
  dragHandleProps,
}) => {
  return (
    <ItemWrapper>
      <DragHandleIcon.Vertical dragHandleProps={dragHandleProps} />
      <span>{label}</span>
    </ItemWrapper>
  );
};

export const Basic = () => {
  return (
    <>
      <h3>Basic - Horizontal</h3>
      <DragDropContainer id="basic-horizontal">
        {times(5).map(key => (
          <Item key={`basic-horizontal-${key}`} label={`Basic Item: ${key}`} />
        ))}
      </DragDropContainer>

      <Spacer />

      <h3>Basic - Vertical</h3>
      <DragDropContainer id="basic-vertical" direction="vertical">
        {times(5).map(key => (
          <Item key={`basic-vertical-${key}`} label={`Basic Item: ${key}`} />
        ))}
      </DragDropContainer>
    </>
  );
};

export const WithDragHandleIcon = () => {
  return (
    <DragDropContainer id="with-drag-handle-icon">
      {times(5).map(key => (
        <ItemHorizontalIcon key={key} label={`Item: ${key}`} />
      ))}
    </DragDropContainer>
  );
};

export const Synchronized = () => {
  const elementKeys = times(5).map(String);

  const [elementsOrder, setElementsOrder] = useState(elementKeys);

  return (
    <>
      <h3>
        Both rows are synchronized. Changing one row changes the other row
        automatically.
      </h3>

      <DragDropContainer
        id="synchronized-row-1"
        elementsOrder={elementsOrder}
        onDragEnd={setElementsOrder}
      >
        {elementKeys.map(key => (
          <Item key={`synchronized-${key}`} label={`Row 1 - Item: ${key}`} />
        ))}
      </DragDropContainer>

      <DragDropContainer
        id="synchronized-row-2"
        elementsOrder={elementsOrder}
        onDragEnd={setElementsOrder}
      >
        {elementKeys.map(key => (
          <Item key={`synchronized-${key}`} label={`Row 2 - Item: ${key}`} />
        ))}
      </DragDropContainer>
    </>
  );
};

export const MasterSlave = () => {
  const elementKeys = times(5).map(String);

  const [elementsOrder, setElementsOrder] = useState(elementKeys);

  return (
    <>
      <h3>
        Changing master row changes the slave row automatically. But not vice
        versa.
      </h3>

      <DragDropContainer id="synchronized-master" onDragEnd={setElementsOrder}>
        {elementKeys.map(key => (
          <Item key={`synchronized-${key}`} label={`Master Item: ${key}`} />
        ))}
      </DragDropContainer>

      <DragDropContainer id="synchronized-slave" elementsOrder={elementsOrder}>
        {elementKeys.map(key => (
          <Item key={`synchronized-${key}`} label={`Slave Item: ${key}`} />
        ))}
      </DragDropContainer>
    </>
  );
};

export const Scrollable = () => {
  return (
    <>
      <h3>Scrollable - Horizontal</h3>
      <ScrollContainerHorizontal>
        <DragDropContainer id="scrollable-horizontal">
          {times(5).map(key => (
            <ItemHorizontalIcon
              key={`scrollable-horizontal-${key}`}
              label={`Item: ${key}`}
            />
          ))}
        </DragDropContainer>
      </ScrollContainerHorizontal>

      <Spacer />

      <h3>Scrollable - Vertical</h3>
      <ScrollContainerVertical>
        <DragDropContainer
          id="drag-drop-container-scrollable-vertical"
          direction="vertical"
        >
          {times(5).map(key => (
            <ItemVerticalIcon
              key={`scrollable-vertical-${key}`}
              label={`Item: ${key}`}
            />
          ))}
        </DragDropContainer>
      </ScrollContainerVertical>
    </>
  );
};

export default {
  title: 'Component/DragDropContainer',
  component: DragDropContainer,
};

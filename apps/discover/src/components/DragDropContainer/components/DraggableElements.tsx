import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import styled from 'styled-components/macro';

import { Flex } from 'styles/layout';

const FlexNoShrink = styled(Flex)`
  flex-shrink: 0;
`;

const getDraggableElement = (element: JSX.Element, index: number) => {
  const id = String(element.key || index);

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided) => (
        <FlexNoShrink ref={provided.innerRef} {...provided.draggableProps}>
          {React.cloneElement(element, {
            ...provided.dragHandleProps,
          })}
        </FlexNoShrink>
      )}
    </Draggable>
  );
};

export const DraggableElements: React.FC<{ children: JSX.Element[] }> =
  React.memo(({ children }) => {
    return <>{React.Children.map(children, getDraggableElement)}</>;
  });

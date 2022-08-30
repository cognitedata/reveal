import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { Flex } from 'styles/layout';

const getDraggableElement = (element: JSX.Element, index: number) => {
  const id = String(element.key || index);

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided) => (
        <Flex ref={provided.innerRef} {...provided.draggableProps}>
          {React.cloneElement(element, {
            ...provided.dragHandleProps,
          })}
        </Flex>
      )}
    </Draggable>
  );
};

export const DraggableElements: React.FC<{ children: JSX.Element[] }> =
  React.memo(({ children }) => {
    return <>{React.Children.map(children, getDraggableElement)}</>;
  });

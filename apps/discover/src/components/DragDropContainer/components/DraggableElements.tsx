import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { Flex } from 'styles/layout';

const getDraggableElement = (element: React.ReactNode, index: number) => {
  return (
    <Draggable key={index} draggableId={String(index)} index={index}>
      {(provided) => (
        <Flex ref={provided.innerRef} {...provided.draggableProps}>
          {React.cloneElement(element as JSX.Element, {
            ...provided.dragHandleProps,
          })}
        </Flex>
      )}
    </Draggable>
  );
};

export const DraggableElements: React.FC<React.PropsWithChildren<unknown>> =
  React.memo(({ children }) => {
    return <>{React.Children.map(children, getDraggableElement)}</>;
  });

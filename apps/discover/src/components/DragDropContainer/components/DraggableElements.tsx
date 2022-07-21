import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const getDraggableElement = (element: React.ReactNode, index: number) => {
  return (
    <Draggable key={index} draggableId={String(index)} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          {React.cloneElement(element as JSX.Element, {
            dragHandleProps: provided.dragHandleProps,
          })}
        </div>
      )}
    </Draggable>
  );
};

export const DraggableElements: React.FC<React.PropsWithChildren<unknown>> =
  React.memo(({ children }) => {
    return <>{React.Children.map(children, getDraggableElement)}</>;
  });

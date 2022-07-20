import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

export const DraggableElements: React.FC<React.PropsWithChildren> = React.memo(
  ({ children }) => {
    return (
      <>
        {React.Children.map(children, (element, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Draggable key={index} draggableId={String(index)} index={index}>
            {(provided) =>
              React.cloneElement(element as JSX.Element, {
                ref: provided.innerRef,
                ...provided.draggableProps,
                ...provided.dragHandleProps,
              })
            }
          </Draggable>
        ))}
      </>
    );
  }
);

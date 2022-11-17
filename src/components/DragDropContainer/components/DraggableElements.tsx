import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { Flex } from 'styles/layout';

const getDraggableElement = (element: JSX.Element, index: number) => {
  const id = String(element.key || index);

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle,
    left: 'auto !important',
    top: 'auto !important',
  });
  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Flex
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          {React.cloneElement(element, {
            dragHandleProps: provided.dragHandleProps,
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

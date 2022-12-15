import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ReactDOM from 'react-dom';

import { Flex } from 'styles/layout';
import { DRAG_DROP_PORTAL_CLASS } from '../constants';

const getDraggableElement = (
  element: JSX.Element,
  index: number,
  isCustomPortal: boolean
) => {
  const id = String(element.key || index);

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle,
  });
  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => {
        const dragDropElement = document
          .getElementsByClassName(DRAG_DROP_PORTAL_CLASS)
          .item(0)!;

        const isCustomPortalCreatable: boolean =
          snapshot.isDragging && isCustomPortal && !!dragDropElement;

        const child: JSX.Element = (
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
        );

        if (isCustomPortalCreatable) {
          return ReactDOM.createPortal(child, dragDropElement);
        }
        return child;
      }}
    </Draggable>
  );
};

export const DraggableElements: React.FC<{
  children: JSX.Element[];
  isCustomPortal: boolean;
}> = React.memo(({ children, isCustomPortal }) => {
  return (
    <>
      {React.Children.map(children, (child: JSX.Element, index: number) =>
        getDraggableElement(child, index, isCustomPortal)
      )}
    </>
  );
});

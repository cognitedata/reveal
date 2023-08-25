import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ReactDOM from 'react-dom';

import { Flex } from '@data-exploration-lib/core';

import { DRAG_DROP_PORTAL_CLASS } from '../constants';

/**
 * If the draggable items are rendered inside a tippy component,
 * the items get disappeared while dragging since,
 * the z-index of tippy has been hard-coded to 9999.
 * Hence, setting this to a far higher value to prevent such issues.
 */
const DRAGGABLE_ITEM_Z_INDEX = 999999;

const getDraggableElement = (
  element: JSX.Element,
  index: number,
  isCustomPortal: boolean
) => {
  const id = String(element.key || index);

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    ...draggableStyle,
    zIndex: DRAGGABLE_ITEM_Z_INDEX,
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

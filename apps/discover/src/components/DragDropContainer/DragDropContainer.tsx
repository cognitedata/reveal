import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import { useDeepMemo } from 'hooks/useDeep';

import { DraggableElements } from './components/DraggableElements';
import { DragDropContainerProps } from './types';
import { getDraggableElementsWrapper } from './utils/getDraggableElementsWrapper';
import { getElementsFromChildren } from './utils/getElementsFromChildren';
import { getReorderedElements } from './utils/getReorderedElements';

export const DragDropContainer: React.FC<
  React.PropsWithChildren<DragDropContainerProps>
> = React.memo(({ id, children, direction }) => {
  const elements = useDeepMemo(
    () => getElementsFromChildren(children),
    [children]
  );

  const [orderedElements, setOrderedElements] = useState(elements);

  const handleDragEnd = (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === result.source.index
    ) {
      return;
    }

    const reorderedElements = getReorderedElements(
      orderedElements,
      result.source.index,
      result.destination.index
    );
    setOrderedElements(reorderedElements);
  };

  const Wrapper = getDraggableElementsWrapper(direction);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={id} direction={direction}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <Wrapper>
              <DraggableElements>{orderedElements}</DraggableElements>
            </Wrapper>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
});

import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';

import isEmpty from 'lodash/isEmpty';

import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { DraggableElements } from './components/DraggableElements';
import { DragDropContainerProps } from './types';
import { getDraggableElementsWrapper } from './utils/getDraggableElementsWrapper';
import { getElementsFromChildren } from './utils/getElementsFromChildren';
import { getReorderedElements } from './utils/getReorderedElements';
import { orderElementsByKey } from './utils/orderElementsByKey';

export const DragDropContainer: React.FC<
  React.PropsWithChildren<DragDropContainerProps>
> = React.memo(({ id, children, direction = 'horizontal', elementsOrder }) => {
  const elements = useDeepMemo(
    () => getElementsFromChildren(children),
    [children]
  );

  const [orderedElements, setOrderedElements] = useState(elements);

  const updatedOrderedElements = (elements: JSX.Element[]) => {
    setOrderedElements([...elements]);
  };

  useDeepEffect(() => updatedOrderedElements(elements), [elements]);

  useDeepEffect(() => {
    if (!elementsOrder || isEmpty(elementsOrder)) return;

    const orderedElementsByKey = orderElementsByKey(elements, elementsOrder);
    updatedOrderedElements(orderedElementsByKey);
  }, [elements, elementsOrder]);

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
          <Wrapper ref={provided.innerRef} {...provided.droppableProps}>
            <DraggableElements>{orderedElements}</DraggableElements>
            {provided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
});

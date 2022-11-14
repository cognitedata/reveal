import React, { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';

import isEmpty from 'lodash/isEmpty';

import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { DraggableElements } from './components/DraggableElements';
import { DragDropContainerProps } from './types';
import { getChildrenProps } from './utils/getChildrenProps';
import { getDraggableElementsWrapper } from './utils/getDraggableElementsWrapper';
import { getElementsFromChildren } from './utils/getElementsFromChildren';
import { getElementsKeys } from './utils/getElementsKeys';
import { getReorderedElements } from './utils/getReorderedElements';
import { orderElementsByKey } from './utils/orderElementsByKey';

export const DragDropContainer: React.FC<
  React.PropsWithChildren<DragDropContainerProps>
> = React.memo(
  ({ id, children, direction = 'horizontal', elementsOrder, onDragEnd }) => {
    const [orderedElements, setOrderedElements] = useState<JSX.Element[]>([]);

    const childrenProps = useDeepMemo(
      () => getChildrenProps(children),
      [children]
    );

    const elements = useDeepMemo(
      () => getElementsFromChildren(children),
      /**
       * We re-render the elements only if any prop is changed.
       * Hence, DON'T put `children` directly into the dependancy array below.
       */
      [childrenProps]
    );

    useDeepEffect(() => {
      if (!elementsOrder || isEmpty(elementsOrder)) {
        setOrderedElements(elements);
        return;
      }

      const orderedElementsByKey = orderElementsByKey(elements, elementsOrder);
      setOrderedElements([...orderedElementsByKey]);
    }, [elements, elementsOrder]);

    const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
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

      if (onDragEnd) {
        const reorderedElementsKeys = getElementsKeys(reorderedElements);
        onDragEnd(reorderedElementsKeys, result, provided);
      }
    };

    const Wrapper = getDraggableElementsWrapper(direction);

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={id} direction={direction}>
          {provided => (
            <Wrapper ref={provided.innerRef} {...provided.droppableProps}>
              <DraggableElements>{orderedElements}</DraggableElements>
              {provided.placeholder}
            </Wrapper>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
);

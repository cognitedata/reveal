import React, { useRef, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  OnDragEndResponder,
} from 'react-beautiful-dnd';
import * as ReactDOM from 'react-dom';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import EmptyState from '@transformations/components/empty-state';
import { getContainer, reorder } from '@transformations/utils';

import {
  Button,
  Colors,
  Dropdown,
  Elevations,
  Icon,
  Input,
  Menu,
} from '@cognite/cogs.js';

const DRAGGABLE_CHILD_HEIGHT = 36;
const DRAGGABLE_CHILD_PADDING = 4;

export type DraggableListItemRenderProps = Omit<DraggableListItem, 'render'>;

export type DraggableListItem = {
  key: string;
  render?: (item: DraggableListItemRenderProps) => React.ReactNode;
  title: string;
};

type DraggableListProps = {
  items: DraggableListItem[];
  onChange: (reorderedItems: DraggableListItem[]) => void;
};

type PortalAwareDraggableChildProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  item: DraggableListItem;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
};

const PortalAwareDraggableChild = ({
  containerRef,
  item,
  provided,
  snapshot,
}: PortalAwareDraggableChildProps) => {
  const { render, ...itemProps } = item;

  const child = (
    <StyledDraggableChildContainer
      $isDragging={snapshot.isDragging}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{ ...provided.draggableProps.style, zIndex: 10000 }}
    >
      <Icon type="DragHandleVertical" />
      {render ? render(itemProps) : item.title}
    </StyledDraggableChildContainer>
  );

  if (snapshot.isDragging) {
    return ReactDOM.createPortal(child, containerRef.current!);
  }

  return child;
};

const DraggableList = ({
  items,
  onChange,
}: DraggableListProps): JSX.Element => {
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const lowerCaseSearchQuery = searchQuery.toLowerCase();

  const filteredItems = items.filter(
    ({ key, title }) =>
      key.toLowerCase().includes(lowerCaseSearchQuery) ||
      title.toLowerCase().includes(lowerCaseSearchQuery)
  );

  const handleDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) {
      return;
    }

    const reordered = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    onChange(reordered);
  };

  return (
    <div ref={containerRef}>
      <Dropdown
        content={
          <Menu>
            <Input
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('filter-by-name')}
              value={searchQuery}
            />
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable
                droppableId="droppable"
                getContainerForClone={() => getContainer()}
              >
                {(provided, snapshot) => (
                  <StyledDraggableListContainer
                    $isDraggingOver={snapshot.isDraggingOver}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => (
                        <Draggable
                          key={item.key}
                          draggableId={item.key}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <PortalAwareDraggableChild
                              containerRef={containerRef}
                              item={item}
                              provided={provided}
                              snapshot={snapshot}
                            />
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <EmptyState description={t('no-column-found')} />
                    )}
                  </StyledDraggableListContainer>
                )}
              </Droppable>
            </DragDropContext>
          </Menu>
        }
      >
        <Button icon="Columns" />
      </Dropdown>
    </div>
  );
};

const StyledDraggableListContainer = styled.div<{
  $isDraggingOver?: boolean;
}>`
  margin-top: 8px;
  min-width: 200px;
  padding-bottom: ${({ $isDraggingOver }) =>
    $isDraggingOver ? DRAGGABLE_CHILD_HEIGHT : 0}px;
`;

const StyledDraggableChildContainer = styled.div<{
  $isDragging?: boolean;
}>`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  display: flex;
  height: ${DRAGGABLE_CHILD_HEIGHT}px;
  gap: 8px;
  padding: 0 ${DRAGGABLE_CHILD_PADDING}px;

  ${({ $isDragging }) =>
    $isDragging
      ? `box-shadow: ${Elevations['elevation--surface--interactive--hover']}`
      : ''};
`;

export default DraggableList;

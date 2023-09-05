import React from 'react';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from 'react-beautiful-dnd';

import PropertyRow from './PropertyRow';
import { Properties } from './types';

type ReorderablePropertyListProps = {
  id: string;
  onDragEnd: OnDragEndResponder;
  properties: Properties;
  onSelect: (id: string) => void;
};

const ReorderablePropertyList: React.FC<ReorderablePropertyListProps> = ({
  id,
  onDragEnd,
  properties,
  onSelect,
}) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId={id}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {properties.map((property, index) => (
            <PropertyRow
              key={property.path}
              property={property}
              index={index}
              onSelect={() => onSelect(property.path)}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
);

export default ReorderablePropertyList;

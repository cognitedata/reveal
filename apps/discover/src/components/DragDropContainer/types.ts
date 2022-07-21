import {
  ContextId,
  Direction,
  DraggableId,
  ElementId,
} from 'react-beautiful-dnd';

export interface DragDropContainerProps {
  id: string;
  direction?: Direction;
  /**
   * Explicitly change the order of elements by a given array of keys.
   * Child nodes must have a key in-order this to work.
   * Then, pass the array of those keys with the required order.
   */
  elementsOrder?: string[];
}

export type WithDragHandleProps<T> = T & DragHandleProps;

export interface DragHandleProps {
  'data-rbd-drag-handle-draggable-id'?: DraggableId;
  'data-rbd-drag-handle-context-id'?: ContextId;
  'aria-describedby'?: ElementId;
  role?: string;
  tabIndex?: number;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<any>;
}

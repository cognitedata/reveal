import {
  Direction,
  DraggableProvided,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';

import { IconProps } from '@cognite/cogs.js';

export interface DragDropContainerProps {
  id: string;
  direction?: Direction;
  /**
   * Explicitly change the order of elements by a given array of keys.
   * Child nodes must have a key in-order this to work.
   * Then, pass the array of those keys with the required order.
   */
  elementsOrder?: string[];
  onDragEnd?: (
    elementsOrder: string[],
    result: DropResult,
    provided: ResponderProvided
  ) => void;
  /**
   * Render dragging option on a custom portal.
   * This is useful when we have to render a drag-drop component on top of another
   * component that has a transform behavior (like dropdowns).
   */
  isCustomPortal?: boolean;
}

export type DragHandleProps = {
  dragHandleProps?: DraggableProvided['dragHandleProps'];
};

export type WithDragHandleProps<T> = T & DragHandleProps;

export type DragHandleIconProps = Omit<IconProps, 'type'> & DragHandleProps;

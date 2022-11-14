import { IconProps } from '@cognite/cogs.js';
import {
  Direction,
  DraggableProvided,
  DropResult,
  ResponderProvided,
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
  onDragEnd?: (
    elementsOrder: string[],
    result: DropResult,
    provided: ResponderProvided
  ) => void;
}

export type DragHandleProps = {
  dragHandleProps?: DraggableProvided['dragHandleProps'];
};

export type WithDragHandleProps<T> = T & DragHandleProps;

export type DragHandleIconProps = Omit<IconProps, 'type'> & DragHandleProps;

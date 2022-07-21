import { Direction, DraggableProvided } from 'react-beautiful-dnd';

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

export type WithDragHandleProps<T> = T &
  Pick<DraggableProvided, 'dragHandleProps'>;

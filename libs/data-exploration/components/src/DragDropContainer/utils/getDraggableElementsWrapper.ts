import { Direction } from 'react-beautiful-dnd';

import { FlexColumn, FlexRow } from '@data-exploration-lib/core';

export const getDraggableElementsWrapper = (direction?: Direction) => {
  switch (direction) {
    case 'vertical':
      return FlexColumn;
    case 'horizontal':
      return FlexRow;
    default:
      return FlexColumn;
  }
};

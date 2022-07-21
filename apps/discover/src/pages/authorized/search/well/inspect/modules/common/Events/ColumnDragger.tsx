import React from 'react';

import { Icon } from '@cognite/cogs.js';

import { ColumnDraggerWrapper } from './elements';

export const ColumnDragger: React.FC<any> = (dragHandleProps) => {
  return (
    <ColumnDraggerWrapper>
      <Icon type="DragHandleHorizontal" {...dragHandleProps} />
    </ColumnDraggerWrapper>
  );
};

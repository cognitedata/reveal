import * as React from 'react';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { BodyColumn } from '../../../common/Events/elements';
import { ColumnVisibilityProps } from '../../types';

export interface ColumnProps extends ColumnVisibilityProps {
  id: string;
  width?: number;
}

export const Column: React.FC<
  React.PropsWithChildren<WithDragHandleProps<ColumnProps>>
> = ({ isVisible = true, id, width, children, ...dragHandleProps }) => {
  return (
    <NoUnmountShowHide show={isVisible}>
      <BodyColumn width={width} data-testid={id}>
        <ColumnDragger {...dragHandleProps} />
        {children}
      </BodyColumn>
    </NoUnmountShowHide>
  );
};

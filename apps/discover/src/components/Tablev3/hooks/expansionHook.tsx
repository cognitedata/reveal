import React from 'react';
import { CellProps, Hooks, Row } from 'react-table';

import { Icon } from '@cognite/cogs.js';

import { ExpandIconWrapper } from '../elements';

interface Props {
  expanded: boolean;
}

export const EXPANSION_COLUMN_ID = 'expansion';

export const Expand: React.FC<Props> = ({ expanded }) => {
  return (
    <ExpandIconWrapper expanded={expanded}>
      <Icon type="ChevronDown" />
    </ExpandIconWrapper>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const expansionHook = <T extends Object>(hooks: Hooks<T>) => {
  hooks.visibleColumns.push((restOfColumns) => [
    // Let's make a column to display the child row expanded status
    {
      id: EXPANSION_COLUMN_ID,
      disableResizing: true,
      width: '30px',
      Header: ' ',
      Cell: ({ row }: CellProps<T>) => (
        <Expand
          expanded={(row as Row<T> & { isExpanded: boolean }).isExpanded}
        />
      ),
    },
    ...restOfColumns,
  ]);
};

import React from 'react';
import { CellProps, Hooks, Row } from 'react-table';

import { Icons } from '@cognite/cogs.js';

import { ExpandIconWrapper } from '../elements';

interface Props {
  expanded: boolean;
}

export const EXPANSION_COLUMN_ID = 'expansion';

export const Expand: React.FC<Props> = ({ expanded }) => {
  return (
    <ExpandIconWrapper expanded={expanded}>
      <Icons.ChevronDown />
    </ExpandIconWrapper>
  );
};

export const expansionHook = (hooks: Hooks<any>) => {
  hooks.visibleColumns.push((restOfColumns) => [
    // Let's make a column to display the child row expanded status
    {
      id: EXPANSION_COLUMN_ID,
      disableResizing: true,
      minWidth: 30,
      width: '30px',
      maxWidth: 30,
      Header: () => <></>,
      Cell: ({ row }: CellProps<any>) => {
        return (
          <Expand
            expanded={(row as Row & { isExpanded: boolean }).isExpanded}
          />
        );
      },
    },
    ...restOfColumns,
  ]);
};

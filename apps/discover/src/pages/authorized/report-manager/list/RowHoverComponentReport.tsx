import * as React from 'react';

import { Row } from '@tanstack/react-table';

import { ViewButton } from 'components/Buttons';

import { HoverContentWrapper } from './elements';
import { TableReport } from './types';

export const RowHoverComponentReport: React.FC<{ row: Row<TableReport> }> = ({
  row,
}) => {
  const handleView = (row: Row<TableReport>) => {
    console.log('Open report:', row.original);
  };

  return (
    <HoverContentWrapper>
      <ViewButton
        hideIcon
        data-testid={`view-report-${row.original.id}`}
        onClick={() => handleView(row)}
      />
    </HoverContentWrapper>
  );
};

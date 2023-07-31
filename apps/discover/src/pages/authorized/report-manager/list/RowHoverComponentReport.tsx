import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Row } from '@tanstack/react-table';

import { ViewButton } from 'components/Buttons';
import { showGlobalSidePanel } from 'modules/global/reducer';

import { HoverContentWrapper } from './elements';
import { TableReport } from './types';

export const RowHoverComponentReport: React.FC<{ row: Row<TableReport> }> = ({
  row,
}) => {
  const dispatch = useDispatch();
  const handleView = (row: Row<TableReport>) => {
    dispatch(
      showGlobalSidePanel({ data: row.original.id!, type: 'WELL_REPORT' })
    );
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

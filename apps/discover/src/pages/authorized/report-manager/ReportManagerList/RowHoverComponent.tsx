import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Row } from '@tanstack/react-table';

import { Button, Tooltip } from '@cognite/cogs.js';

import { ViewButton } from 'components/Buttons';
// import { Tooltip } from 'components/Tooltip';

import { HoverContentWrapper } from './elements';
import { TableReport } from './types';

// export const renderRowHoverComponent = React.useCallback(({ row }: any) => {
export const RowHoverComponent: React.FC<{ row: Row<TableReport> }> = ({
  row,
}) => {
  const pathToCopy = `test-path-${row.original.id}`;

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
      <Tooltip content="Copy to clipboard">
        <CopyToClipboard text={pathToCopy}>
          <Button
            aria-label="Copy path"
            icon="Copy"
            size="small"
            type="ghost"
            data-testid="report-url-copy-icon"
          />
        </CopyToClipboard>
      </Tooltip>
    </HoverContentWrapper>
  );
};

import * as React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Row } from '@tanstack/react-table';

import { Button, Tooltip } from '@cognite/cogs.js';

import { URL_PARAM_WELLBORE_FILTER } from './constants';
import { HoverContentWrapper } from './elements';
import { TableReport } from './types';

export const RowHoverComponentWellbore: React.FC<{ row: Row<TableReport> }> = ({
  row,
}) => {
  const pathToCopy = `${window.location.origin}${window.location.pathname}?${URL_PARAM_WELLBORE_FILTER}=${row.original.externalId}`;

  return (
    <HoverContentWrapper>
      <Tooltip content="Copy to clipboard">
        <CopyToClipboard text={pathToCopy}>
          <Button
            aria-label="Copy path"
            icon="Copy"
            size="small"
            data-testid="report-url-copy-icon"
          />
        </CopyToClipboard>
      </Tooltip>
    </HoverContentWrapper>
  );
};

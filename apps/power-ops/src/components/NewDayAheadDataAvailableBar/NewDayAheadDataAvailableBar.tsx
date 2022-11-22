import { Button } from '@cognite/cogs.js';
import { ComponentProps } from 'react';

import { StyledInfobar } from './elements';

type Props = {
  onReloadClick: ComponentProps<typeof Button>['onClick'];
};

export const NewDayAheadDataAvailableBar = ({ onReloadClick }: Props) => (
  <StyledInfobar className="new-matrix">
    New day-ahead process data available. We recommend that you update this
    page.
    <Button
      type="tertiary"
      size="small"
      icon="Refresh"
      iconPlacement="right"
      onClick={onReloadClick}
    >
      Update
    </Button>
  </StyledInfobar>
);

import { Button } from '@cognite/cogs.js';

import { StyledInfobar } from './elements';

type Props = {
  onReloadClick: () => void;
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

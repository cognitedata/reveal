import { Button } from '@cognite/cogs.js';

import { CLEAR_ALL_TEXT } from 'components/tableEmpty/constants';

export interface Props {
  onClick: () => void;
}

export const FilterClearAllButton: React.FC<Props> = (props) => {
  return (
    <Button
      type="secondary"
      size="small"
      onClick={props.onClick}
      icon="Close"
      iconPlacement="right"
      data-testid="clear-all-filter-button"
    >
      {CLEAR_ALL_TEXT}
    </Button>
  );
};

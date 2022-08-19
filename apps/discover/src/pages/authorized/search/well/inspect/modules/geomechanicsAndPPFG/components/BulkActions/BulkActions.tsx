import * as React from 'react';

import { CloseButton, BaseButton } from 'components/Buttons';
import TableBulkActions from 'components/TableBulkActions';
import { CLEAR_SELECTION_TEXT } from 'pages/authorized/search/well/content/constants';

import { WellWellboreSelection } from '../../types';
import { getWellboreSelectionInfo } from '../../utils/getWellboreSelectionInfo';

import { BulkActionsWrapper } from './elements';

export type BulkActionsProps = {
  wellWellboreSelection: WellWellboreSelection;
  onClickCompare: () => void;
  onClose: () => void;
};

export const BulkActions: React.FC<BulkActionsProps> = ({
  wellWellboreSelection,
  onClickCompare,
  onClose,
}) => {
  const { title, subtitle, selectedWellboresCount } = getWellboreSelectionInfo(
    wellWellboreSelection
  );

  if (!selectedWellboresCount) {
    return null;
  }

  return (
    <BulkActionsWrapper>
      <TableBulkActions
        isVisible={Boolean(selectedWellboresCount)}
        title={title}
        subtitle={subtitle}
      >
        <BaseButton
          type="primary"
          text="Compare"
          aria-label="View"
          variant="inverted"
          size="default"
          onClick={onClickCompare}
        />

        <TableBulkActions.Separator />

        <CloseButton
          variant="inverted"
          tooltip={CLEAR_SELECTION_TEXT}
          onClick={onClose}
          aria-label={CLEAR_SELECTION_TEXT}
        />
      </TableBulkActions>
    </BulkActionsWrapper>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';

import { CloseButton, BaseButton } from 'components/buttons';
import TableBulkActions from 'components/table-bulk-actions';

import { getSelectedWellboresTitle, getSelectedWellsTitle } from '../utils';

type Props = {
  wellsCount: number;
  wellboresCount: number;
  handleDeselectAll: () => void;
  compare: () => void;
};

export const WellCentricBulkActions: React.FC<Props> = ({
  wellsCount,
  wellboresCount,
  handleDeselectAll,
  compare,
}) => {
  const { t } = useTranslation('Search');

  return (
    <TableBulkActions
      isVisible={!!wellboresCount}
      title={getSelectedWellboresTitle(wellboresCount)}
      subtitle={getSelectedWellsTitle(wellsCount)}
    >
      <BaseButton
        type="primary"
        text="Compare"
        aria-label="View"
        variant="inverted"
        size="default"
        onClick={compare}
      />

      <TableBulkActions.Separator />

      <CloseButton
        variant="inverted"
        tooltip={t('Clear selection')}
        onClick={handleDeselectAll}
        aria-label="Clear selection"
      />
    </TableBulkActions>
  );
};

import React from 'react';

import { CloseButton, BaseButton } from 'components/Buttons';
import TableBulkActions from 'components/TableBulkActions';
import { useTranslation } from 'hooks/useTranslation';
import { CLEAR_SELECTION_TEXT } from 'pages/authorized/search/well/content/constants';

import { getSelectedWellboresTitle, getSelectedWellsTitle } from '../utils';

import { COMPARE_TEXT } from './constants';

export type Props = {
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
        text={t(COMPARE_TEXT)}
        aria-label="View"
        variant="inverted"
        size="default"
        onClick={compare}
      />

      <TableBulkActions.Separator />

      <CloseButton
        variant="inverted"
        tooltip={t(CLEAR_SELECTION_TEXT)}
        onClick={handleDeselectAll}
        aria-label={CLEAR_SELECTION_TEXT}
      />
    </TableBulkActions>
  );
};

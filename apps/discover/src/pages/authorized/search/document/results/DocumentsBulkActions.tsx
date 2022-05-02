import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/AddToFavoriteSetMenu';
import { FavoriteButton, CloseButton } from 'components/Buttons';
import TableBulkActions from 'components/TableBulkActions';

type Props = {
  selectedDocumentIds: number[];
  handleDeselectAll: () => void;
};

export const DocumentsBulkActions: React.FC<Props> = ({
  selectedDocumentIds,
  handleDeselectAll,
}) => {
  const { t } = useTranslation('Search');

  const selectedDocumentsCount = useMemo(
    () => selectedDocumentIds.length,
    [selectedDocumentIds]
  );

  const title = `${selectedDocumentsCount} ${
    selectedDocumentsCount > 1 ? 'documents' : 'document'
  } selected`;

  return (
    <TableBulkActions isVisible={!!selectedDocumentsCount} title={title}>
      <Dropdown
        placement="top"
        content={<AddToFavoriteSetMenu documentIds={selectedDocumentIds} />}
      >
        <FavoriteButton
          tooltip={t('Add the selected documents to favorites')}
          data-testid="document-favorite-all-button"
        />
      </Dropdown>

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

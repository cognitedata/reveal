import React from 'react';

import { Dropdown, Button } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { DocumentType } from 'modules/documentSearch/types';

import { FAVORITE_OFF_ICON } from '../../../constants';

export const AddToFavoritesButton: React.FC<{ document: DocumentType }> = ({
  document,
}) => {
  // this wasn't working, don't know if it needs to be enabled
  // const [isFavored, setFavored] = React.useState<boolean>(false);

  // const getIconTitle = useMemo(
  //   () => (isFavored ? FAVORITE_ON_ICON : FAVORITE_OFF_ICON),
  //   [isFavored]
  // );
  return (
    <Dropdown
      content={<AddToFavoriteSetMenu documentIds={[Number(document.doc.id)]} />}
    >
      <Button
        type="ghost"
        icon={FAVORITE_OFF_ICON}
        title={FAVORITE_OFF_ICON}
        iconPlacement="right"
        data-testid="favourite-select-icon-button"
        aria-label="Open favorites dropdown"
      />
    </Dropdown>
  );
};

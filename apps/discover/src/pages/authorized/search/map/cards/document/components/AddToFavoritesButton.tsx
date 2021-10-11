import React, { useState, useMemo } from 'react';

import { Dropdown, Button } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { DocumentType } from 'modules/documentSearch/types';

import { FAVORITE_OFF_ICON, FAVORITE_ON_ICON } from '../../../constants';

export const AddToFavoritesButton: React.FC<{ document: DocumentType }> = ({
  document,
}) => {
  const [isFavored, setFavored] = React.useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleShowDropdown = () => {
    setShowDropdown(true);
  };

  const handleHideDropdown = () => {
    setShowDropdown(false);
  };

  const getIconTitle = useMemo(
    () => (isFavored ? FAVORITE_ON_ICON : FAVORITE_OFF_ICON),
    [isFavored]
  );
  return (
    <Dropdown
      content={
        <div>
          {showDropdown && (
            <AddToFavoriteSetMenu
              documentIds={[Number(document.doc.id)]}
              setFavored={setFavored}
              parentCallBack={handleHideDropdown}
            />
          )}
        </div>
      }
    >
      <Button
        type="ghost"
        icon={getIconTitle}
        title={getIconTitle}
        iconPlacement="right"
        data-testid="favourite-select-icon-button"
        onClick={handleShowDropdown}
        aria-label="Open favorites dropdown"
      />
    </Dropdown>
  );
};

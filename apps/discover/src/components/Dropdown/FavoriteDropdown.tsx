import { useState } from 'react';

import { Dropdown } from '@cognite/cogs.js';

import { AddToFavoriteSetMenu } from 'components/AddToFavoriteSetMenu/AddToFavoriteSetMenu';
import { FavoriteButton } from 'components/Buttons';
import { FavoredStarButton } from 'components/Buttons/FavoredStarButton';
import { FavoriteContentWells } from 'modules/favorite/types';

export const FavoriteDropdown: React.FC<{
  isFavored?: boolean;
  well?: FavoriteContentWells;
  documentId?: string;
}> = ({ isFavored = false, well, documentId }) => {
  const [visible, setVisible] = useState<boolean>(false);

  const handleSelectOption = () => {
    setTimeout(() => setVisible(false), 1500);
  };

  const onClick = () => {
    setVisible((previousState) => !previousState);
  };

  return (
    <Dropdown
      visible={visible}
      content={
        <AddToFavoriteSetMenu
          wells={well}
          documentIds={documentId ? [Number(documentId)] : []}
          handleSelectOption={handleSelectOption}
        />
      }
      onClickOutside={() => setVisible(false)}
    >
      {isFavored ? (
        <FavoredStarButton onClick={onClick} />
      ) : (
        <FavoriteButton
          variant="default"
          iconPlacement="right"
          data-testid="favourite-select-icon-button"
          aria-label="Open favorites dropdown"
          onClick={onClick}
        />
      )}
    </Dropdown>
  );
};

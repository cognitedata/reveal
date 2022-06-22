import {
  useFavoriteShareMutate,
  useFavoriteRemoveShareMutate,
} from 'domain/favorites/internal/actions/useFavoritesMutate';
import { useFavoriteQuery } from 'domain/favorites/internal/queries/useFavoriteQuery';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BasicShareModal } from 'components/BasicShareModal';
import { SharedUsersList } from 'components/BasicShareModal/SharedUsersList';
import { UserOption } from 'components/SearchUsers/SearchUsers';
import { showSuccessMessage } from 'components/Toast';
import {
  REMOVE_SHARE_SUCCESS_TOAST,
  SHARE_FAVORITE_MODAL_TITLE,
  SHARE_SUCCESS_TOAST,
} from 'pages/authorized/favorites/modals/constants';

interface Props {
  isOpen: boolean;
  favoriteId: string;
  onCancel: () => void;
}

const ShareFavoriteSetModal: React.FC<Props> = (props) => {
  const { isOpen, onCancel, favoriteId } = props;
  const { mutateAsync: shareFavoriteMutate } = useFavoriteShareMutate();
  const { mutateAsync: removeShareFavoriteMutate } =
    useFavoriteRemoveShareMutate();
  const { data: favorite } = useFavoriteQuery(favoriteId);

  const { t } = useTranslation();

  const handleShareFavorite = (users: UserOption[]) => {
    if (users.length) {
      shareFavoriteMutate({
        favoriteId,
        userIds: users.map((user) => user.value),
      }).then(() => {
        showSuccessMessage(t(SHARE_SUCCESS_TOAST));
      });
    }
  };

  const handleRemoveShareFavorite = (id: string) => {
    removeShareFavoriteMutate({
      favoriteId,
      user: id,
    }).then(() => {
      showSuccessMessage(t(REMOVE_SHARE_SUCCESS_TOAST));
    });
  };

  const sharedUsers = useMemo(
    () =>
      favorite
        ? [favorite.owner, ...favorite.sharedWith.map((row) => row.user)]
        : [],
    [favorite]
  );

  return (
    <BasicShareModal
      title={t(SHARE_FAVORITE_MODAL_TITLE)}
      onCancel={onCancel}
      isOpen={isOpen}
      onShare={handleShareFavorite}
    >
      <SharedUsersList
        users={sharedUsers}
        onRemove={handleRemoveShareFavorite}
      />
    </BasicShareModal>
  );
};

export default ShareFavoriteSetModal;

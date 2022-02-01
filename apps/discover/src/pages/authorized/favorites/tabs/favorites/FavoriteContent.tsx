import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { CommentTarget, SetCommentTarget } from '@cognite/react-comments';

import navigation from 'constants/navigation';
import {
  useFavoriteDuplicateMutate,
  useFavoritesDeleteMutate,
} from 'modules/api/favorites/useFavoritesMutate';
import { useFavoritesGetAllQuery } from 'modules/api/favorites/useFavoritesQuery';
import { useIsOwner } from 'modules/api/user/utils';
import { useViewMode } from 'modules/favorite/selectors';
import { FavoriteSummary, ViewModeType } from 'modules/favorite/types';

import {
  DeleteFavoriteSetModal,
  ShareFavoriteSetModal,
  DuplicateFavoriteSetModal,
  EditFavoriteSetModal,
} from '../../modals';

import { EmptyCard } from './EmptyCard';
import GridView from './gridView';
import ListView from './listView';
import { ModalType } from './types';

export interface Props {
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}
export const FavoriteContent: React.FC<Props> = ({
  setCommentTarget,
  commentTarget,
}) => {
  const [actionModal, setActionModal] = useState<ModalType | null>(null);
  const [selectedItem, setSelectedItem] = useState<
    FavoriteSummary | undefined
  >();
  const [showEmptyCard, setShowEmptyCard] = useState<boolean>(true);

  const viewMode = useViewMode();
  const { data: favoriteSets, status } = useFavoritesGetAllQuery();

  useEffect(() => {
    setShowEmptyCard(status === 'loading' || !favoriteSets?.length);
  }, [status, favoriteSets?.length]);

  const { mutate: mutateDeleteFavorite } = useFavoritesDeleteMutate();
  const { mutate: mutateDuplicateFavorite } = useFavoriteDuplicateMutate();

  const history = useHistory();

  // close comment sidebar on page change
  React.useEffect(() => {
    return () => setCommentTarget(undefined);
  }, []);

  const { isOwner } = useIsOwner();

  const handleNavigateFavoriteSet = (item: FavoriteSummary) => {
    history.push(navigation.FAVORITE_TAB_DOCUMENTS(item.id));
  };

  const dispatchRemoveFavouriteSet = (item: FavoriteSummary) => {
    mutateDeleteFavorite(item.id);
  };

  const closeActionModal = () => setActionModal(null);

  const handleDeleteLibrary = (item: FavoriteSummary) => {
    dispatchRemoveFavouriteSet(item);
    closeActionModal();
  };

  const duplicateFavoriteSet = (item: {
    name: string;
    description?: string;
  }) => {
    if (selectedItem) {
      mutateDuplicateFavorite({ id: selectedItem.id, payload: item });
    }
    closeActionModal();
  };

  const handleOpenModal = (modal: ModalType, item?: FavoriteSummary) => {
    setActionModal(modal);
    if (item) {
      setSelectedItem({ ...item });
    }
  };

  return (
    <>
      {showEmptyCard ? (
        <EmptyCard isLoading={status === 'loading'} />
      ) : (
        <>
          {viewMode === ViewModeType.Card ? (
            <GridView
              handleNavigateFavoriteSet={handleNavigateFavoriteSet}
              handleOpenModal={handleOpenModal}
              sets={favoriteSets || []}
              isOwner={isOwner}
              setCommentTarget={setCommentTarget}
            />
          ) : (
            <ListView
              handleNavigateFavoriteSet={handleNavigateFavoriteSet}
              handleOpenModal={handleOpenModal}
              sets={favoriteSets || []}
              isOwner={isOwner}
              setCommentTarget={setCommentTarget}
              commentTarget={commentTarget}
            />
          )}

          {selectedItem && (
            <>
              <DeleteFavoriteSetModal
                isOpen={actionModal === 'Delete'}
                onCancel={closeActionModal}
                item={selectedItem}
                onConfirm={handleDeleteLibrary}
              />

              <DuplicateFavoriteSetModal
                isOpen={actionModal === 'Create'}
                onCancel={closeActionModal}
                item={selectedItem}
                onConfirm={duplicateFavoriteSet}
              />

              <EditFavoriteSetModal
                isOpen={actionModal === 'Edit'}
                onCancel={closeActionModal}
                item={selectedItem}
              />

              {actionModal === 'Share' && (
                <ShareFavoriteSetModal
                  isOpen
                  onCancel={closeActionModal}
                  favoriteId={selectedItem.id}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

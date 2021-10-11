import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import FeedbackPanel from 'components/modals/entity-feedback';
import { useFavoritesGetOneQuery } from 'modules/api/favorites/useFavoritesQuery';
import { zipAndDownloadDocumentsByIds } from 'modules/documentPreview/utils';
import { FavoriteDetailsContent } from 'pages/authorized/favorites/tabs/favorites/detailsPage/FavoriteDetailsContent';
import { PageBottomPaddingWrapper } from 'styles/layout';

import { ShareFavoriteSetModal, EditFavoriteSetModal } from '../../../modals';

import { FavoriteDetailsHeader } from './header';

type openModalType = 'edit' | 'share' | 'preview' | null;

export const FavoriteDetails: React.FC = () => {
  const [openModal, setOpenModal] = useState<openModalType>(null);
  const { favoriteId } = useParams<{
    favoriteId: string;
  }>();

  const { data: favorite, isFetching } = useFavoritesGetOneQuery(favoriteId);

  const toggleModal = (modal: openModalType) =>
    setOpenModal(openModal ? null : modal);

  const Header = React.useMemo(
    () => (
      <FavoriteDetailsHeader
        favorite={favorite}
        isLoading={isFetching}
        handleToggleShareModal={() => toggleModal('share')}
        handleToggleEditModal={() => toggleModal('edit')}
        handleDownloadAllDocuments={() => {
          if (favorite) {
            zipAndDownloadDocumentsByIds(favorite.content.documentIds);
          }
        }}
      />
    ),
    [favorite?.id, favorite?.name, favorite?.description]
  );

  return (
    <>
      {Header}
      <PageBottomPaddingWrapper>
        <FavoriteDetailsContent
          content={favorite?.content}
          favoriteId={favoriteId}
          ownerId={favorite?.owner.id}
        />
        {favorite && (
          <>
            <EditFavoriteSetModal
              item={favorite}
              isOpen={openModal === 'edit'}
              onCancel={() => toggleModal(null)}
            />
            {openModal === 'share' && (
              <ShareFavoriteSetModal
                isOpen
                onCancel={() => toggleModal(null)}
                favoriteId={favorite.id}
              />
            )}
          </>
        )}
        <FeedbackPanel />
      </PageBottomPaddingWrapper>
    </>
  );
};

import { zipAndDownloadDocumentsByIds } from 'domain/documents/service/utils/utils';
import { useFavoriteQuery } from 'domain/favorites/internal/queries/useFavoriteQuery';

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components/macro';

import { SetCommentTarget } from '@cognite/react-comments';

import { COMMENT_NAMESPACE } from 'constants/comments';
import { FavoriteDetailsContent } from 'pages/authorized/favorites/tabs/favorites/detailsPage/FavoriteDetailsContent';
import { FlexColumn, PageBottomPaddingWrapper } from 'styles/layout';

import { ShareFavoriteSetModal, EditFavoriteSetModal } from '../../../modals';

import { FavoriteDetailsHeader } from './header';

type openModalType = 'edit' | 'share' | 'preview' | null;

const ResetHeader = styled(FlexColumn)`
  flex: 1;
  margin: -40px;
`;

export const FavoriteDetails: React.FC<{
  setCommentTarget: SetCommentTarget;
}> = ({ setCommentTarget }) => {
  const [openModal, setOpenModal] = useState<openModalType>(null);
  const { favoriteId } = useParams<{
    favoriteId: string;
  }>();

  const { data: favorite, isFetching } = useFavoriteQuery(favoriteId);

  const handleComment = () =>
    setCommentTarget({
      id: favoriteId,
      targetType: COMMENT_NAMESPACE.favorite,
    });

  const toggleModal = (modal: openModalType) =>
    setOpenModal(openModal ? null : modal);

  const Header = React.useMemo(
    () => (
      <FavoriteDetailsHeader
        favorite={favorite}
        isLoading={isFetching}
        handleComment={handleComment}
        handleToggleShareModal={() => toggleModal('share')}
        handleToggleEditModal={() => toggleModal('edit')}
        handleDownloadAllDocuments={() => {
          if (favorite) {
            zipAndDownloadDocumentsByIds(favorite.content.documentIds);
          }
        }}
      />
    ),
    [favorite?.id, favorite?.name, favorite?.description, isFetching]
  );

  return (
    <ResetHeader>
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
      </PageBottomPaddingWrapper>
    </ResetHeader>
  );
};

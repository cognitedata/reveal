import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { useIsOwner } from 'services/user/utils';

import {
  ShareButton,
  CommentButton,
  DownloadButton,
  EditButton,
  BackButton,
} from 'components/buttons';
import Header from 'components/header/Header';
import { showInfoMessageWithTitle } from 'components/toast';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { FavoriteSummary } from 'modules/favorite/types';
import {
  DOWNLOAD_MESSAGE,
  DOWNLOADING,
} from 'pages/authorized/search/constants';

interface ActionProps {
  favorite: FavoriteSummary;
  handleToggleShareModal: () => void;
  handleToggleEditModal: () => void;
  handleComment: () => void;
  handleDownloadAllDocuments: () => void;
}
const Actions: React.FC<ActionProps> = ({
  favorite,
  handleDownloadAllDocuments,
  handleComment,
  handleToggleEditModal,
  handleToggleShareModal,
}) => {
  const { t } = useTranslation('Favorites');
  const metrics = useGlobalMetrics('favorites');
  const { data: favoriteConfig } = useProjectConfigByKey('favorites');

  const { isOwner } = useIsOwner();
  const checkIfIsOwner = isOwner(favorite.owner.id);

  const handleDownloadAll = () => {
    metrics.track('click-download-all-documents-button');
    showInfoMessageWithTitle(t(DOWNLOADING), t(DOWNLOAD_MESSAGE));
    handleDownloadAllDocuments();
  };

  return (
    <>
      {checkIfIsOwner && (
        <ShareButton
          type="tertiary"
          tooltip={t('Share set')}
          onClick={handleToggleShareModal}
        />
      )}

      {favoriteConfig && favoriteConfig.showDownloadAllDocumentsButton && (
        <DownloadButton
          type="tertiary"
          size="small"
          tooltip={t('Download set')}
          onClick={handleDownloadAll}
          disabled={!favorite}
        />
      )}

      {checkIfIsOwner && (
        <EditButton
          type="tertiary"
          tooltip={t('Edit set')}
          onClick={handleToggleEditModal}
        />
      )}

      <CommentButton onClick={handleComment} type="tertiary" />
    </>
  );
};

export interface Props {
  favorite: FavoriteSummary | undefined;
  handleToggleShareModal: () => void;
  handleToggleEditModal: () => void;
  handleComment: () => void;
  handleDownloadAllDocuments: () => void;
  isLoading?: boolean;
}
export const FavoriteDetailsHeader: React.FC<Props> = React.memo(
  ({
    favorite,
    handleComment,
    handleToggleShareModal,
    handleToggleEditModal,
    handleDownloadAllDocuments,
    isLoading,
  }) => {
    const history = useHistory();

    const handleBack = () => {
      history.push(navigation.FAVORITES);
    };

    const renderActions = () => {
      const hasFetchedFavorites = !isLoading && favorite;

      if (hasFetchedFavorites) {
        return (
          <Actions
            favorite={favorite}
            handleComment={handleComment}
            handleToggleEditModal={handleToggleEditModal}
            handleToggleShareModal={handleToggleShareModal}
            handleDownloadAllDocuments={handleDownloadAllDocuments}
          />
        );
      }

      return null;
    };

    const renderBackButton = () => <BackButton onClick={handleBack} />;

    return (
      <Header
        title={favorite?.name || ''}
        description={favorite?.description}
        isLoading={isLoading}
        Right={renderActions}
        Left={renderBackButton}
      />
    );
  }
);

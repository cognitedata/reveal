import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { ProjectConfigFavorites } from '@cognite/discover-api-types';

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
import { useIsOwner } from 'modules/api/user/utils';
import { FavoriteSummary } from 'modules/favorite/types';
import {
  DOWNLOAD_MESSAGE,
  DOWNLOADING,
} from 'pages/authorized/search/document/inspect/constants';

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
  const { data: favoriteConfig } =
    useProjectConfigByKey<ProjectConfigFavorites>('favorites');

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
export const FavoriteDetailsHeader: React.FC<Props> = React.memo((props) => {
  const {
    favorite,
    handleComment,
    handleToggleShareModal,
    handleToggleEditModal,
    handleDownloadAllDocuments,
    isLoading,
  } = props;

  const history = useHistory();

  const handleBack = () => {
    history.push(navigation.FAVORITES);
  };

  return (
    <Header
      title={favorite?.name || ''}
      description={favorite?.description}
      isLoading={isLoading}
      Right={() =>
        !isLoading && favorite ? (
          <Actions
            favorite={favorite}
            handleComment={handleComment}
            handleToggleEditModal={handleToggleEditModal}
            handleToggleShareModal={handleToggleShareModal}
            handleDownloadAllDocuments={handleDownloadAllDocuments}
          />
        ) : null
      }
      Left={() => <BackButton onClick={handleBack} />}
    />
  );
});

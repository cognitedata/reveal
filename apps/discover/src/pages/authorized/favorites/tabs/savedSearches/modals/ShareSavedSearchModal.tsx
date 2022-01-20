import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { reportException } from '@cognite/react-errors';

import { BasicShareModal } from 'components/basic-share-modal';
import { SharedUsersList } from 'components/basic-share-modal/SharedUsersList';
import { UserOption } from 'components/search-users/SearchUsers';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { useSavedSearchRemoveShareMutate } from 'modules/api/savedSearches/useSavedSearchesMutate';
import { useQuerySavedSearcheGetOne } from 'modules/api/savedSearches/useSavedSearchQuery';
import { REMOVE_SHARE_SUCCESS_TOAST } from 'pages/authorized/favorites/modals/constants';

interface Props {
  isOpen: boolean;
  savedSearchId: string;
  onCancel: () => void;
  onShare: (users: UserOption[]) => void;
}

export const ShareSavedSearchModal: React.FC<Props> = (props) => {
  const { isOpen, savedSearchId, onCancel, onShare } = props;
  const { data: savedSearch } = useQuerySavedSearcheGetOne(savedSearchId);
  const { mutateAsync: removeShareSavedSearchMutate } =
    useSavedSearchRemoveShareMutate();

  const { t } = useTranslation();

  const sharedUsers = useMemo(() => {
    if (savedSearch?.owner) {
      return [
        savedSearch.owner,
        ...(savedSearch?.sharedWith || []).map((row) => row.user),
      ];
    }
    return [];
  }, [savedSearch]);

  const handleRemoveShareFavorite = (id: string) => {
    removeShareSavedSearchMutate({
      id: savedSearchId,
      user: id,
    })
      .then(() => {
        showSuccessMessage(t(REMOVE_SHARE_SUCCESS_TOAST));
      })
      .catch((error) => {
        showErrorMessage(t('Something went wrong'));
        reportException(error);
      });
  };

  return (
    <BasicShareModal
      title={t('Share saved search')}
      onCancel={onCancel}
      isOpen={isOpen}
      onShare={onShare}
    >
      <SharedUsersList
        users={sharedUsers}
        onRemove={handleRemoveShareFavorite}
      />
    </BasicShareModal>
  );
};

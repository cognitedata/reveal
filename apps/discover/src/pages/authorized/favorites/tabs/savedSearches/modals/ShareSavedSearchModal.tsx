import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSavedSearchRemoveShareMutate } from 'services/savedSearches/useSavedSearchesMutate';
import { useQuerySavedSearcheGetOne } from 'services/savedSearches/useSavedSearchQuery';
import { handleServiceError } from 'utils/errors';

import { BasicShareModal } from 'components/basic-share-modal';
import { SharedUsersList } from 'components/basic-share-modal/SharedUsersList';
import { UserOption } from 'components/search-users/SearchUsers';
import { showSuccessMessage } from 'components/toast';
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
      .catch(handleServiceError);
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

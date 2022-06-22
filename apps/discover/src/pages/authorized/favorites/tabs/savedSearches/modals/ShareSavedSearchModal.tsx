import { useSavedSearchRemoveShareMutate } from 'domain/savedSearches/internal/actions/useSavedSearchRemoveShareMutate';
import { useQuerySavedSearcheGetOne } from 'domain/savedSearches/internal/queries/useQuerySavedSearcheGetOne';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { handleServiceError } from 'utils/errors';

import { BasicShareModal } from 'components/BasicShareModal';
import { SharedUsersList } from 'components/BasicShareModal/SharedUsersList';
import { UserOption } from 'components/SearchUsers/SearchUsers';
import { showSuccessMessage } from 'components/Toast';
import { REMOVE_SHARE_SUCCESS_TOAST } from 'pages/authorized/favorites/modals/constants';

import { SHARE_SAVED_SEARCH } from '../constants';

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
      title={t(SHARE_SAVED_SEARCH)}
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

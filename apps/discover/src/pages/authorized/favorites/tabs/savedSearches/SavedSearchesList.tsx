import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from 'react-table';

import { Button } from '@cognite/cogs.js';
import { SetCommentTarget } from '@cognite/react-comments';
import { getTenantInfo } from '@cognite/react-container';

import { shortDate } from '_helpers/date';
import { sortDates } from '_helpers/dateConversion';
import { log } from '_helpers/log';
import EmptyState from 'components/emptyState';
import InlineLink from 'components/inlineLink';
import { UserOption } from 'components/search-users/SearchUsers';
import { Table } from 'components/tablev3';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { COMMENT_NAMESPACE } from 'constants/comments';
import { EMPTY_FIELD_PLACEHOLDER } from 'constants/general';
import navigation from 'constants/navigation';
import { useSavedSearchNavigation } from 'hooks/useSavedSearchNavigation';
import { useSavedSearch } from 'modules/api/savedSearches/hooks/useSavedSearch';
import { SavedSearchItem } from 'modules/api/savedSearches/types';
import { useQuerySavedSearchesList } from 'modules/api/savedSearches/useQuery';
import {
  useSavedSearchAddShareMutate,
  useSavedSearchDeleteMutate,
} from 'modules/api/savedSearches/useSavedSearchesMutate';
import { getJsonHeaders } from 'modules/api/service';
import { useUserProfileQuery } from 'modules/api/user/useUserQuery';
import { getFullNameOrDefaultText } from 'modules/user/utils';
import { PageContainer } from 'pages/authorized/favorites/elements';

import { Actions } from './Actions';
import { DeleteSavedSearchModal, ShareSavedSearchModal } from './modals';

export type ModalType = 'Share' | 'Delete';

export const SavedSearches: React.FC<{
  setCommentTarget: SetCommentTarget;
}> = ({ setCommentTarget }) => {
  const { t } = useTranslation('Saved Searches');
  const options = { checkable: false, flex: false, disableSorting: true };
  const headers = getJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const user = useUserProfileQuery();
  const [selectedItem, setSelectedItem] = useState<
    SavedSearchItem | undefined
  >();
  const [actionModal, setActionModal] = useState<ModalType | null>(null);

  // close comment sidebar on page change
  React.useEffect(() => {
    return () => setCommentTarget(undefined);
  }, []);

  const { mutateAsync: addShare } = useSavedSearchAddShareMutate();
  const { mutate: deleteMutate } = useSavedSearchDeleteMutate();
  const loadSavedSearch = useSavedSearch();
  const handleSavedSearchNavigation = useSavedSearchNavigation();

  const savedSearches = useQuerySavedSearchesList();

  const handleRowClick = ({ original }: { original: SavedSearchItem }) => {
    log('Content:', [original.value], 1);
  };

  const handleLaunch = (item: SavedSearchItem) => () => {
    loadSavedSearch(item.value);
    showSuccessMessage('Loading saved search.');
    handleSavedSearchNavigation(item);
  };

  const handleSavedSearchShare = (users: UserOption[]) => {
    if (!selectedItem?.value.id || users?.length === 0) return;

    const shareWithUsers = users.map((item) => item.value);

    addShare({ id: selectedItem.value.id, users: shareWithUsers })
      .then(() => {
        showSuccessMessage(t('Successfully shared'));
      })
      .catch((error) => {
        log(`Error in saved search share: ${error}`);
        showErrorMessage(t('Error while sharing, please try again later'));
      });
  };

  const handleSavedSearchDelete = () => {
    if (!selectedItem?.value.id) return;

    showSuccessMessage(t('Deleting saved search'));
    deleteMutate({ id: selectedItem.value.id, headers, tenant });
    closeActionModal();
  };

  const handleOpenModal = (modal: ModalType, item: SavedSearchItem) => {
    if (item.value.id) {
      setSelectedItem(item);
      setActionModal(modal);
    }
  };

  const closeActionModal = () => {
    setSelectedItem(undefined);
    setActionModal(null);
  };

  const showEmptyState = !savedSearches?.data?.length;

  const columns = React.useMemo(
    () => [
      {
        id: 'launch-saved-search',
        disableSorting: true,
        width: '50px',
        Cell: ({
          row: { original },
        }: {
          row: { original: SavedSearchItem };
        }) => (
          <Button
            type="ghost"
            icon="ArrowUpRight"
            onClick={handleLaunch(original)}
            aria-label="Launch saved search"
            data-testid="launch-saved-search"
          />
        ),
      },
      {
        Header: t('Title'),
        accessor: 'name',
        width: '300px',
        maxWidth: '1fr',
      },
      {
        Header: t('Created by'),
        width: '300px',
        accessor: (row: SavedSearchItem) =>
          row.owner
            ? getFullNameOrDefaultText(row.owner)
            : EMPTY_FIELD_PLACEHOLDER,
      },
      {
        Header: t('Created'),
        accessor: (row: SavedSearchItem) => shortDate(row.value.createdTime),
        sortType: (rowA: Row<SavedSearchItem>, rowB: Row<SavedSearchItem>) =>
          sortDates(
            shortDate(rowA.original.value.createdTime),
            shortDate(rowB.original.value.createdTime)
          ),
        width: '300px',
      },
      {
        id: 'saved-search-actions',
        Header: '  ',
        disableSorting: true,
        width: 'auto',
      },
    ],
    []
  );

  const renderRowHoverComponent: React.FC<{
    row: Row<SavedSearchItem>;
  }> = ({ row }) => {
    const isOwner = user.data?.id === row.original?.owner?.id;
    return (
      <Actions
        row={row}
        handleShare={
          isOwner
            ? (item: SavedSearchItem) => handleOpenModal('Share', item)
            : undefined
        }
        handleDelete={(item: SavedSearchItem) =>
          handleOpenModal('Delete', item)
        }
        handleComment={(item: SavedSearchItem) => {
          setCommentTarget({
            id: item.value.id as string,
            targetType: COMMENT_NAMESPACE.savedSearch,
          });
        }}
      />
    );
  };

  return (
    <>
      {showEmptyState ? (
        <EmptyState img="Search" isLoading={savedSearches.isLoading}>
          <InlineLink href={navigation.SEARCH_DOCUMENTS}>
            {t('Search')}
          </InlineLink>{' '}
          {t('to get started')}
        </EmptyState>
      ) : (
        <PageContainer>
          <Table<SavedSearchItem>
            id="saved-searches-list"
            data={savedSearches?.data || []}
            options={options}
            columns={columns}
            handleRowClick={handleRowClick}
            renderRowHoverComponent={renderRowHoverComponent}
          />
        </PageContainer>
      )}

      {selectedItem?.value.id && actionModal === 'Share' && (
        <ShareSavedSearchModal
          isOpen
          onCancel={closeActionModal}
          onShare={handleSavedSearchShare}
          savedSearchId={selectedItem.value.id}
        />
      )}

      <DeleteSavedSearchModal
        isOpen={actionModal === 'Delete'}
        onCancel={closeActionModal}
        item={selectedItem}
        onConfirm={handleSavedSearchDelete}
      />
    </>
  );
};

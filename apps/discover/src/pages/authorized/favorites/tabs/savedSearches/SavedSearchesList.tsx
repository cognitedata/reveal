import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSavedSearch } from 'services/savedSearches/hooks/useSavedSearch';
import { SavedSearchItem } from 'services/savedSearches/types';
import {
  useSavedSearchAddShareMutate,
  useSavedSearchDeleteMutate,
} from 'services/savedSearches/useSavedSearchesMutate';
import { useQuerySavedSearchesList } from 'services/savedSearches/useSavedSearchQuery';
import { useUserProfileQuery } from 'services/user/useUserQuery';
import { shortDate } from 'utils/date';
import { log } from 'utils/log';
import { sortDates } from 'utils/sortDates';

import { Menu, Dropdown } from '@cognite/cogs.js';
import { SetCommentTarget, CommentTarget } from '@cognite/react-comments';

import { ViewButton, MoreOptionsButton } from 'components/buttons';
import EmptyState from 'components/emptyState';
import InlineLink from 'components/inlineLink';
import { UserOption } from 'components/search-users/SearchUsers';
import { Table, TableResults, RowProps } from 'components/tablev3';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { COMMENT_NAMESPACE } from 'constants/comments';
import { EMPTY_FIELD_PLACEHOLDER } from 'constants/general';
import navigation from 'constants/navigation';
import { useSavedSearchNavigation } from 'hooks/useSavedSearchNavigation';
import { getFullNameOrDefaultText } from 'modules/user/utils';
import { PageContainer } from 'pages/authorized/favorites/elements';
import { FlexRow } from 'styles/layout';

import { VertSeperator, DangerButton, HoverMenuItem } from '../../elements';

import { Actions } from './Actions';
import {
  SAVED_SEARCH_TABLE_MENU_REMOVE_OPTION,
  SAVED_SEARCH_TABLE_MENU_SHARE_OPTION,
  SAVED_SEARCH_DELETED_MESSAGE,
  SAVED_SEARCH_SHARED_MESSAGE,
} from './constants';
import { DeleteSavedSearchModal, ShareSavedSearchModal } from './modals';

export type ModalType = 'Share' | 'Delete';

export const SavedSearches: React.FC<{
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}> = ({ setCommentTarget, commentTarget }) => {
  const { t } = useTranslation('Saved Searches');
  const options = { checkable: false, flex: false, disableSorting: true };
  const user = useUserProfileQuery();
  const [selectedItem, setSelectedItem] = useState<
    SavedSearchItem | undefined
  >();
  const [actionModal, setActionModal] = useState<ModalType | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<TableResults>();

  // close comment sidebar on page change
  React.useEffect(() => {
    return () => setCommentTarget(undefined);
  }, []);

  const { mutateAsync: addShare } = useSavedSearchAddShareMutate();
  const { mutate: deleteSavedSearch } = useSavedSearchDeleteMutate();
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
        showSuccessMessage(t(SAVED_SEARCH_SHARED_MESSAGE));
      })
      .catch((error) => {
        log(`Error in saved search share: ${error}`);
        showErrorMessage(t('Error while sharing, please try again later'));
      });
  };

  const handleSavedSearchDelete = () => {
    if (!selectedItem?.value.id) return;

    showSuccessMessage(t(SAVED_SEARCH_DELETED_MESSAGE));
    deleteSavedSearch(selectedItem.value.id);
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
        sortType: (
          rowA: RowProps<SavedSearchItem>,
          rowB: RowProps<SavedSearchItem>
        ) =>
          sortDates(
            shortDate(rowA.original.value.createdTime),
            shortDate(rowB.original.value.createdTime)
          ),
        width: '140px',
      },
    ],
    []
  );

  React.useEffect(() => {
    setHighlightedIds(commentTarget ? { [commentTarget.id]: true } : {});
  }, [commentTarget]);

  const renderRowHoverComponent: React.FC<{
    row: RowProps<SavedSearchItem>;
  }> = ({ row }) => {
    const isOwner = user.data?.id === row.original?.owner?.id;
    return (
      <FlexRow>
        <ViewButton
          data-testid="button-view-saved-search"
          onClick={handleLaunch(row.original)}
          hideIcon
        />
        <Dropdown
          openOnHover
          content={
            <Menu>
              <Menu.Item
                disabled={!isOwner}
                onClick={() => {
                  handleOpenModal('Share', row.original);
                }}
              >
                <HoverMenuItem>
                  {SAVED_SEARCH_TABLE_MENU_SHARE_OPTION}
                </HoverMenuItem>
              </Menu.Item>
              <Menu.Divider data-testid="menu-divider" />
              <DangerButton
                onClick={() => handleOpenModal('Delete', row.original)}
              >
                {SAVED_SEARCH_TABLE_MENU_REMOVE_OPTION}
              </DangerButton>
            </Menu>
          }
        >
          <MoreOptionsButton data-testid="menu-button" />
        </Dropdown>
        <VertSeperator />
        <Actions
          row={row}
          handleComment={(item: SavedSearchItem) => {
            setHighlightedIds({ [row.original.value.id as string]: true });
            setCommentTarget({
              id: item.value.id as string,
              targetType: COMMENT_NAMESPACE.savedSearch,
            });
          }}
        />
      </FlexRow>
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
            highlightedIds={highlightedIds}
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

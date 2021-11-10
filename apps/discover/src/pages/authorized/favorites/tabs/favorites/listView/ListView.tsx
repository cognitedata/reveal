import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from 'react-table';

import { Avatar, Menu, Dropdown } from '@cognite/cogs.js';
import { CommentTarget, SetCommentTarget } from '@cognite/react-comments';

import { shortDate } from '_helpers/date';
import { sortDates } from '_helpers/dateConversion';
import { MoreOptionsButton, CommentButton } from 'components/buttons';
import { Table, TableResults } from 'components/tablev3';
import { COMMENT_NAMESPACE } from 'constants/comments';
import { FavoriteSummary } from 'modules/favorite/types';
import {
  getFavoriteLastUpdateByUserName,
  getFavoriteLastUpdatedByDateTime,
} from 'modules/favorite/utils';
import { getFullNameOrDefaultText } from 'modules/user/utils';
import { PageContainer } from 'pages/authorized/favorites/elements';
import { FlexRow } from 'styles/layout';

import { FAVORITE_LIST_CONTAINER } from '../../../constants';
import { VertSeperator, DangerDiv, HoverMenuItem } from '../../../elements';
import { ModalType, RowType } from '../types';

import {
  HOVER_MENU_ITEM_DUPLICATE,
  HOVER_MENU_ITEM_DELETE,
  HOVER_MENU_ITEM_EDIT,
  HOVER_MENU_ITEM_SHARE,
} from './constants';

export interface Props {
  sets: FavoriteSummary[];
  handleOpenModal: (type: ModalType, item: FavoriteSummary) => void;
  handleNavigateFavoriteSet: (item: FavoriteSummary) => void;
  isOwner: (userId: string) => boolean;
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}

const ListView: React.FC<Props> = ({
  sets: favorites,
  isOwner,
  handleNavigateFavoriteSet,
  handleOpenModal,
  setCommentTarget,
  commentTarget,
}) => {
  const { t } = useTranslation('Favorites');
  const options = { checkable: false, flex: false };
  const [highlightedIds, setHighlightedIds] = React.useState<TableResults>();

  const columns = useMemo(
    () => [
      {
        id: 'Acronym',
        width: '76px',
        disableSorting: true,
        Cell: ({ row: { original } }: RowType) => (
          <Avatar
            text={getFullNameOrDefaultText(original.owner)}
            maxLength={2}
          />
        ),
      },
      {
        width: '100px',
        maxWidth: '0.5fr',
        Header: t('Set Title'),
        accessor: (row: FavoriteSummary) => row.name || '-',
      },
      {
        Header: t('Description'),
        width: '100px',
        maxWidth: '0.5fr',
        accessor: (row: FavoriteSummary) => row.description || '-',
      },
      {
        Header: t('Created by'),
        width: '170px',
        accessor: (row: FavoriteSummary) => getFullNameOrDefaultText(row.owner),
      },
      {
        Header: t('Date created'),
        width: '170px',
        accessor: (row: FavoriteSummary) => shortDate(row.createdTime),
        sortType: (rowA: Row<FavoriteSummary>, rowB: Row<FavoriteSummary>) =>
          sortDates(
            shortDate(rowA.original.createdTime),
            shortDate(rowB.original.createdTime)
          ),
      },
      {
        Header: t('Last update by'),
        width: '170px',
        accessor: (row: FavoriteSummary) =>
          getFavoriteLastUpdateByUserName(row.lastUpdatedBy),
      },
      {
        Header: t('Date updated'),
        width: '170px',
        accessor: (row: FavoriteSummary) =>
          shortDate(getFavoriteLastUpdatedByDateTime(row.lastUpdatedBy)),
        sortType: (rowA: Row<FavoriteSummary>, rowB: Row<FavoriteSummary>) =>
          sortDates(
            shortDate(rowA.original.lastUpdatedTime),
            shortDate(rowB.original.lastUpdatedTime)
          ),
      },
    ],
    []
  );

  React.useEffect(() => {
    setHighlightedIds(commentTarget ? { [commentTarget.id]: true } : {});
  }, [commentTarget]);

  const data = useMemo(() => {
    return favorites.filter((favourite) => favourite);
  }, [favorites]);

  const handleRowClick = useCallback((row: Row) => {
    handleNavigateFavoriteSet(row.original as FavoriteSummary);
  }, []);

  const renderRowHoverComponent = ({ row: { original } }: RowType) => {
    const _isOwner = isOwner(original.owner.id);
    return (
      <FlexRow>
        <Dropdown
          openOnHover
          content={
            <Menu>
              <Menu.Item
                disabled={!_isOwner}
                onClick={() => {
                  handleOpenModal('Create', original);
                }}
              >
                <HoverMenuItem>{HOVER_MENU_ITEM_DUPLICATE}</HoverMenuItem>
              </Menu.Item>
              <Menu.Item
                disabled={!_isOwner}
                onClick={() => {
                  handleOpenModal('Edit', original);
                }}
              >
                <HoverMenuItem>{HOVER_MENU_ITEM_EDIT}</HoverMenuItem>
              </Menu.Item>
              <Menu.Item
                disabled={!_isOwner}
                onClick={() => {
                  handleOpenModal('Share', original);
                }}
              >
                <HoverMenuItem>{HOVER_MENU_ITEM_SHARE}</HoverMenuItem>
              </Menu.Item>
              <Menu.Divider data-testid="menu-divider" />
              <Menu.Item
                onClick={() => {
                  handleOpenModal('Delete', original);
                }}
              >
                <DangerDiv>{HOVER_MENU_ITEM_DELETE}</DangerDiv>
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOptionsButton data-testid="menu-button" />
        </Dropdown>
        <VertSeperator />
        <CommentButton
          onClick={() => {
            setHighlightedIds({ [original.id]: true });
            setCommentTarget({
              id: original.id,
              targetType: COMMENT_NAMESPACE.favorite,
            });
          }}
        />
      </FlexRow>
    );
  };

  return (
    <PageContainer data-testid={FAVORITE_LIST_CONTAINER}>
      <Table<FavoriteSummary>
        id="list-favourite"
        data={data}
        options={options}
        columns={columns}
        renderRowHoverComponent={renderRowHoverComponent}
        handleRowClick={handleRowClick}
        highlightedIds={highlightedIds}
      />
    </PageContainer>
  );
};

export default ListView;

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from 'react-table';

import { shortDate } from 'utils/date';
import { sortDates } from 'utils/sortDates';

import { Menu, Dropdown } from '@cognite/cogs.js';
import { CommentTarget, SetCommentTarget } from '@cognite/react-comments';

import { MoreOptionsButton, CommentButton } from 'components/buttons';
import { AvatarWrapper, IconWrapper } from 'components/card/element';
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

import {
  FAVORITE_LIST_CONTAINER,
  DELETE_FAVORITE_CARD_BUTTON,
  DUPLICATE_FAVORITE_CARD_BUTTON,
  DUPLICATE_SET_MODAL_BUTTON_TEXT,
  EDIT_FAVORITE_CARD_BUTTON,
  SHARE_FAVORITE_CARD_BUTTON,
} from '../../../constants';
import { VertSeperator, HoverMenuItem, DangerButton } from '../../../elements';
import { ModalType, RowType } from '../types';

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
  const options = {
    checkable: false,
    flex: false,
    sortBy: [
      {
        id: 'Date updated',
        desc: false,
      },
    ],
  };
  const [highlightedIds, setHighlightedIds] = React.useState<TableResults>();

  const columns = useMemo(
    () => [
      {
        id: 'Acronym',
        width: '76px',
        disableSorting: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: () => (
          <AvatarWrapper>
            <IconWrapper type="Folder" />
          </AvatarWrapper>
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
          sortDates(rowA.original.createdTime, rowB.original.createdTime),
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
            new Date(
              getFavoriteLastUpdatedByDateTime(rowB.original.lastUpdatedBy)
            ),
            new Date(
              getFavoriteLastUpdatedByDateTime(rowA.original.lastUpdatedBy)
            )
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
                  handleOpenModal(DUPLICATE_SET_MODAL_BUTTON_TEXT, original);
                }}
              >
                <HoverMenuItem>{DUPLICATE_FAVORITE_CARD_BUTTON}</HoverMenuItem>
              </Menu.Item>
              <Menu.Item
                disabled={!_isOwner}
                onClick={() => {
                  handleOpenModal(EDIT_FAVORITE_CARD_BUTTON, original);
                }}
              >
                <HoverMenuItem>{EDIT_FAVORITE_CARD_BUTTON}</HoverMenuItem>
              </Menu.Item>
              <Menu.Item
                disabled={!_isOwner}
                onClick={() => {
                  handleOpenModal(SHARE_FAVORITE_CARD_BUTTON, original);
                }}
              >
                <HoverMenuItem>{SHARE_FAVORITE_CARD_BUTTON}</HoverMenuItem>
              </Menu.Item>
              <Menu.Divider data-testid="menu-divider" />
              <DangerButton
                onClick={() =>
                  handleOpenModal(DELETE_FAVORITE_CARD_BUTTON, original)
                }
              >
                {DELETE_FAVORITE_CARD_BUTTON}
              </DangerButton>
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

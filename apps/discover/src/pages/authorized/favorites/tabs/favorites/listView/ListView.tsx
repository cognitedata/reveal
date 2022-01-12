import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from 'react-table';

import { shortDate } from 'utils/date';
import { sortDates } from 'utils/sortDates';

import { CommentTarget, SetCommentTarget } from '@cognite/react-comments';

import { CommentButton } from 'components/buttons';
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

import { FAVORITE_LIST_CONTAINER } from '../../../constants';
import Actions from '../Actions';
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
      <>
        <Actions
          set={original}
          handleOpenModal={handleOpenModal}
          showEditButton={_isOwner}
          showDeleteButton={_isOwner}
          showShareButton={_isOwner}
        />
        <CommentButton
          size="default"
          onClick={() =>
            setCommentTarget({
              id: original.id,
              targetType: COMMENT_NAMESPACE.favorite,
            })
          }
        />
      </>
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

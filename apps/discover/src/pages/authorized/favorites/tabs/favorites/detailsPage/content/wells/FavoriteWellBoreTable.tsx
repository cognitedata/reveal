import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy';
import { useFavoriteUpdateContent } from 'services/favorites/useFavoritesMutate';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { MoreOptionsButton, ViewButton } from 'components/buttons';
import { RowProps, Table } from 'components/tablev3';
import { showErrorMessage } from 'components/toast';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { FavoriteContentWells } from 'modules/favorite/types';
import { SelectedMap } from 'modules/filterData/types';
import { useNavigateToWellInspect } from 'modules/wellInspect/hooks/useNavigateToWellInspect';
import { useWellboresOfWellById } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import {
  getWellboresByWellboreIds,
  getWellboresByWellIds,
} from 'modules/wellSearch/service';
import { Wellbore, Well, WellboreId, WellId } from 'modules/wellSearch/types';
import {
  WellboreColumns,
  WellboreSubtableOptions,
} from 'pages/authorized/constant';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import {
  FAVORITE_WELLBORE_LOADING_ERROR_TEXT,
  NO_WELLBORES_FOUND,
} from 'pages/authorized/search/well/content/constants';
import LoadingWellbores from 'pages/authorized/search/well/content/result/LoadingWellbores';
import { Message } from 'pages/authorized/search/well/content/result/WellBoreResultTable';
import { FlexRow } from 'styles/layout';

import {
  FavoriteWelboreResultsTableWrapper,
  RemoveFavoriteLabel,
} from './elements';

export interface Props {
  well: Well;
  wellboreIds?: WellboreId[];
  favoriteContentWells: FavoriteContentWells;
  favoriteId: string;
  removeWell: (wellId: number) => void;
  setWellboreIds: (wellId: WellId, wellboreId: WellboreId) => void;
  selectedWellbores: WellboreId[];
}

const WellboreResult: React.FC<Props> = ({
  well,
  wellboreIds = [],
  favoriteContentWells,
  favoriteId,
  removeWell,
  setWellboreIds,
  selectedWellbores,
}) => {
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);
  const [wellbores, setWellbores] = useState<Wellbore[]>(
    useWellboresOfWellById(well.id, wellboreIds)
  );

  const { t } = useTranslation('WellData');
  const navigateToWellInspect = useNavigateToWellInspect();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const columns = WellboreColumns(userPreferredUnit);
  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);
  const [hoveredWellbore, setHoveredWellbore] = useState<Wellbore>();
  const { mutateAsync: mutateFavoriteContent } = useFavoriteUpdateContent();
  const [selectedWellboreIds, setSelectedWellboreIds] = useState<SelectedMap>(
    {}
  );

  useDeepEffect(() => {
    if (!isEmpty(wellbores)) return;
    if (isEmpty(wellboreIds)) {
      getWellboresByWellIds([well.id]).then((res) => {
        setWellbores(res);
      });
    } else {
      getWellboresByWellboreIds(wellboreIds)
        .then((res) => {
          setWellbores(res);
        })
        .catch(() => showErrorMessage(FAVORITE_WELLBORE_LOADING_ERROR_TEXT));
    }
  }, [wellboreIds, wellbores]);

  useDeepEffect(() => {
    if (!isEqual(selectedWellbores, Object.keys(selectedWellboreIds))) {
      const newSelectedWellboreIds = selectedWellbores.reduce(
        (previous, current) => ({
          ...previous,
          [current]: true,
        }),
        {} as SelectedMap
      );

      setSelectedWellboreIds(newSelectedWellboreIds);
    }
  }, [selectedWellbores]);

  const getSortedWellbores = (wellboreList: Wellbore[] | undefined) =>
    wellboreList ? sortBy(wellboreList, 'name') : [];

  const sortedWellbores = useDeepMemo(
    () => getSortedWellbores(wellbores),
    [wellbores]
  );

  if (isEmpty(wellbores)) {
    return <LoadingWellbores />;
  }

  if (isEmpty(sortedWellbores)) {
    return <Message>{t(NO_WELLBORES_FOUND)}</Message>;
  }

  const handleRemoveWellbore = (): void => {
    if (isUndefined(hoveredWellbore)) return;
    removeWellbore(well, hoveredWellbore.id);
    handleCloseDeleteModal();
  };

  const removeWellbore = (well: Well, wellboreId: WellboreId): void => {
    const favoriteWellContent: FavoriteContentWells = favoriteContentWells;

    favoriteWellContent[well.id] = getRelevantWellboreIds(well).filter(
      (wellbore) => !isEqual(wellbore, wellboreId)
    );

    if (isEmpty(favoriteWellContent[well.id])) {
      removeWell(well.id);
      return;
    }
    mutateFavoriteContent({
      id: favoriteId,
      updateData: {
        wells: favoriteContentWells ? favoriteWellContent : {},
      },
    }).then(() => setWellbores([]));
  };

  const getRelevantWellboreIds = (well: Well): WellboreId[] => {
    return isEmpty(favoriteContentWells[well.id])
      ? well.wellbores?.flatMap((wellbore) => [wellbore.id]) || []
      : favoriteContentWells[well.id] || [];
  };

  const handleViewClick = (row: RowProps<Wellbore>): void => {
    const wellboreId = row.original.id;
    navigateToWellInspect({ wellIds: [well.id], wellboreIds: [wellboreId] });
  };

  const renderRowHoverComponent: React.FC<{
    row: RowProps<Wellbore>;
  }> = ({ row }) => {
    const wellbore = row.original;
    return (
      <FlexRow>
        <ViewButton
          data-testid="button-view-document"
          onClick={() => handleViewClick(row)}
          hideIcon
        />
        <Dropdown
          openOnHover
          content={
            <Menu>
              <Menu.Item
                onClick={() => {
                  handleOpenDeleteModal();
                  setHoveredWellbore(wellbore);
                }}
              >
                <RemoveFavoriteLabel data-testid="remove-from-set">
                  {t(REMOVE_FROM_SET_TEXT)}
                </RemoveFavoriteLabel>
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOptionsButton data-testid="menu-button" />
        </Dropdown>
      </FlexRow>
    );
  };

  const handleRowSelect = (row: RowProps<Wellbore>) => {
    setSelectedWellboreIds((prevState) => ({
      ...prevState,
      [row.original.id]: !prevState[row.original.id],
    }));

    setWellboreIds(row.original.wellId, row.original.id);
  };

  return (
    <FavoriteWelboreResultsTableWrapper>
      <Table<Wellbore>
        id="wellbore-result-table"
        data={sortedWellbores}
        columns={columns}
        options={WellboreSubtableOptions}
        renderRowHoverComponent={renderRowHoverComponent}
        handleRowSelect={handleRowSelect}
        selectedIds={selectedWellboreIds}
        hideHeaders
        indent
      />

      <DeleteWellFromSetModal
        title={hoveredWellbore?.name}
        onConfirm={handleRemoveWellbore}
        onClose={handleCloseDeleteModal}
        isOpen={isDeleteWellModalOpen}
        isWell={false}
      />
    </FavoriteWelboreResultsTableWrapper>
  );
};

export const FavoriteWellboreTable = React.memo(WellboreResult);

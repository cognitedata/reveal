import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { MoreOptionsButton, ViewButton } from 'components/buttons';
import { RowProps, Table } from 'components/tablev3';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useVisibleWellboreColumns } from 'hooks/useVisibleWellboreColumns';
import { SelectedMap } from 'modules/inspectTabs/types';
import { Wellbore, WellboreId } from 'modules/wellSearch/types';
import { WellboreSubtableOptions } from 'pages/authorized/constant';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import { NO_WELLBORES_FOUND } from 'pages/authorized/search/well/content/constants';
import { Message } from 'pages/authorized/search/well/content/result/WellBoreResultTable';
import { FlexRow } from 'styles/layout';

import {
  FavoriteWelboreResultsTableWrapper,
  RemoveFavoriteLabel,
} from './elements';

export interface Props {
  wellbores: Wellbore[];
  selectedWellboreIds: WellboreId[];
  onRemoveWellbores: (wellboreIds: string[]) => void;
  onViewWellbores: (wellboreIds: string[]) => void;
  onSelectedWellbore: (wellboreId: string) => void;
}

const WellboreResult: React.FC<Props> = ({
  wellbores,
  selectedWellboreIds,
  onRemoveWellbores,
  onViewWellbores,
  onSelectedWellbore,
}) => {
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);

  const { t } = useTranslation('WellData');
  const columns = useVisibleWellboreColumns();
  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);
  const [hoveredWellbore, setHoveredWellbore] = useState<Wellbore>();

  const [selectedWellbores, setSelectedWellbores] = useState<SelectedMap>({});

  useDeepEffect(() => {
    setSelectedWellbores(
      selectedWellboreIds.reduce((previousValue, currentValue) => {
        return { ...previousValue, [currentValue]: true };
      }, {})
    );
  }, [selectedWellboreIds]);

  const getSortedWellbores = (wellboreList: Wellbore[] | undefined) =>
    wellboreList ? sortBy(wellboreList, 'name') : [];

  const sortedWellbores = useDeepMemo(
    () => getSortedWellbores(wellbores),
    [wellbores]
  );

  if (isEmpty(sortedWellbores)) {
    return <Message>{t(NO_WELLBORES_FOUND)}</Message>;
  }

  const handleRemoveWellbore = (): void => {
    if (isUndefined(hoveredWellbore)) return;
    onRemoveWellbores([hoveredWellbore?.id]);
    handleCloseDeleteModal();
  };

  const handleViewClick = (row: RowProps<Wellbore>): void => {
    onViewWellbores([row.original.id]);
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
    onSelectedWellbore(row.original.id);
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
        selectedIds={selectedWellbores}
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

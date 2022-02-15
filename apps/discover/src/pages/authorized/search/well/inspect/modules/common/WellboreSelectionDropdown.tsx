import React, { useMemo, useState } from 'react';

import { Icons } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import ManageColumnsPanel from 'components/manage-columns-panel';
import { GroupedColumn } from 'components/manage-columns-panel/ManageColumnsPanel';
import { Wellbore } from 'modules/wellSearch/types';

import {
  WellboreSelectionRow,
  WellboreDropdownWrapper,
  WellboreSelectionButtonContainer,
  WellboreSelectionButtonLabel,
  WellboreSelectionButton,
  WellboreSelectionButtonValue,
  WellboreSelectionImageContainer,
} from './elements';
import {
  checkIndeterminateState,
  checkSelectAllState,
  mapToGroupColumns,
  searchByDescription,
} from './utils';

interface Props {
  onSelectWellbore: (item: Wellbore[]) => void;
  allWellbores: Wellbore[];
  selectedWellbores: Wellbore[];
}

/**
 * @deprecated we don't need this now (I think) since we have the left sidebar to toggle between well(bore)s
 */
const WellboreSelectionDropdown: React.FC<Props> = (props: Props) => {
  const { onSelectWellbore, selectedWellbores, allWellbores } = props;
  const { t } = useTranslation();

  const [searchValue, setSearchValue] = useState<string>();
  const [visible, setVisible] = useState(false);

  const searchWellbores = useMemo(() => {
    if (!searchValue) return allWellbores;

    // filter by name and description
    return searchByDescription(allWellbores, searchValue);
  }, [searchValue, allWellbores]);

  const handleIndeterminateState = () =>
    checkIndeterminateState(
      allWellbores,
      selectedWellbores,
      searchWellbores,
      searchValue
    );

  const handleSelectAllState = () =>
    checkSelectAllState(selectedWellbores, searchWellbores, searchValue);

  const getColumns = useMemo((): GroupedColumn[] => {
    const mappedData: GroupedColumn[] = mapToGroupColumns(
      selectedWellbores,
      searchWellbores
    );

    // if search result is null, searchWellbores contains all wellbores
    if (searchWellbores && searchWellbores.length) {
      mappedData.unshift({
        label: '',
        columns: [
          {
            field: '__all__',
            selected: handleSelectAllState(),
            name: 'All',
            item: undefined,
            indeterminate: handleIndeterminateState(),
          },
        ],
      });
    }

    return mappedData;
  }, [searchWellbores, selectedWellbores]);

  const handleMarkersSelection = (selectedColumn: {
    selected: boolean;
    name: string;
    item: Wellbore;
  }) => {
    if (selectedColumn.name === 'All') {
      handleSelectAllMarkers(!selectedColumn.selected);
    } else {
      onSelectWellbore(
        selectedColumn.selected
          ? selectedWellbores.filter((wb) => wb.id !== selectedColumn.item.id)
          : [...selectedWellbores, selectedColumn.item]
      );
    }
  };

  const handleSelectAllMarkers = (isAllSelected: boolean) => {
    if (isAllSelected) {
      onSelectWellbore(
        searchValue ? [...selectedWellbores, ...searchWellbores] : allWellbores
      );
    } else {
      // triggers on de-select all
      // make sure to only de-select the searched wellbores.
      const result = selectedWellbores.filter(
        (selectedWellbore) =>
          !searchWellbores.some(
            (searchWellbore) => selectedWellbore.id === searchWellbore.id
          )
      );
      onSelectWellbore(result);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchValue(value);
  };

  const getLabel = () =>
    selectedWellbores.length > 1 ? t('Wellbores') : t('Wellbore');

  const getValue = () =>
    selectedWellbores.length === allWellbores.length
      ? 'All'
      : `${selectedWellbores.length}`;

  const customRenderDropDown = React.useMemo(
    () => (
      <WellboreSelectionButton
        aria-label="Column setting"
        data-testid="wellbore-dropdown"
        onClick={() => {
          setVisible((current) => !current);
        }}
        visible={visible?.toString()}
      >
        <WellboreSelectionButtonContainer>
          <WellboreSelectionButtonLabel>
            {getLabel()}
          </WellboreSelectionButtonLabel>
          <WellboreSelectionButtonValue>
            {getValue()}
          </WellboreSelectionButtonValue>
          <WellboreSelectionImageContainer>
            <Icons.ChevronDown />
          </WellboreSelectionImageContainer>
        </WellboreSelectionButtonContainer>
      </WellboreSelectionButton>
    ),
    [selectedWellbores, visible]
  );

  return (
    <WellboreSelectionRow>
      <WellboreDropdownWrapper>
        <ManageColumnsPanel
          columns={getColumns}
          handleColumnSelection={handleMarkersSelection}
          groupedColumns
          includeSearchInput
          searchInputChange={handleSearchInputChange}
          customRenderDropDown={customRenderDropDown}
          placement="bottom-start"
          visibility={visible}
          onVisibilityToggle={(state) => setVisible(state)}
        />
      </WellboreDropdownWrapper>
    </WellboreSelectionRow>
  );
};

export default WellboreSelectionDropdown;

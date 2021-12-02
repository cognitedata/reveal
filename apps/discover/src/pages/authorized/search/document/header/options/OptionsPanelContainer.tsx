import React from 'react';
import { connect } from 'react-redux';

import { StoreState, TS_FIX_ME } from 'core';
import sortBy from 'lodash/sortBy';

import { documentSearchActions } from 'modules/documentSearch/actions';
import {
  Column,
  ViewMode,
  AvailableColumn,
} from 'modules/documentSearch/types';
import { getAvailableColumns } from 'modules/documentSearch/utils/columns';

import { columnMap } from '../../results/DocumentResultTable';

import OptionsPanel from './OptionsPanel';

interface Props {
  // viewMode: ViewMode;
  selectedColumns: string[];
  // searchForSensitive: boolean;
  // isGroupSimilarResults: boolean;
  // setViewModel: (viewMode: ViewMode) => void;

  addSelectedColumn: (column: Column) => void;
  removeSelectedColumn: (column: Column) => void;
  // setSelectedColumns: (columns: string[]) => void;

  // handleSearchInSensitiveToggle: (value: boolean) => void;
  // hideGroupDuplicateOption?: boolean;
}

const OptionsPanelContainer: React.FC<Props> = (props) => {
  const {
    // viewMode,
    selectedColumns,
    // searchForSensitive,
    // isGroupSimilarResults,
    // setViewModel,

    addSelectedColumn,
    removeSelectedColumn,
    // setSelectedColumns,

    // handleSearchInSensitiveToggle,
    // hideGroupDuplicateOption = true,
  } = props;

  const availableColumns = getAvailableColumns(columnMap);

  const handleColumnSelection = (column: AvailableColumn) => {
    const toggledColumn = {
      ...column,
      selected: !column.selected,
    };

    if (toggledColumn.selected) {
      addSelectedColumn(toggledColumn);
    } else {
      removeSelectedColumn(toggledColumn);
    }
  };

  // const handleSelectAllColumns = (value: boolean) => {
  //   const columns = availableColumns
  //     .filter((column) => value || column.disabled)
  //     .map((column) => column.field);

  //   setSelectedColumns(columns);
  // };

  // const toggleSearchInSensitive = (
  //   _event: React.ChangeEvent<HTMLInputElement>,
  //   checked: boolean
  // ) => {
  //   handleSearchInSensitiveToggle(checked);
  // };

  const mergedColumns = availableColumns.map((availableColumn) => {
    return {
      ...availableColumn,
      selected: selectedColumns.includes(availableColumn.field),
    };
  });
  const sortedColumns = sortBy(mergedColumns, 'order');

  return (
    <OptionsPanel
      // setViewModel={setViewModel}
      handleColumnSelection={handleColumnSelection}
      // handleSearchInSensitiveToggle={toggleSearchInSensitive}
      // handleSelectAllColumns={handleSelectAllColumns}
      // viewMode={viewMode}
      columns={sortedColumns}
      // searchForSensitive={searchForSensitive}
      // isGroupSimilarResults={isGroupSimilarResults}
      // hideGroupDuplicateOption={hideGroupDuplicateOption}
    />
  );
};

function mapDispatchToProps(dispatch: TS_FIX_ME) {
  return {
    handleSearchInSensitiveToggle: (value: boolean) =>
      dispatch(documentSearchActions.setSearchForSensitive(value)),
    setSelectedColumns: (columns: string[]) =>
      dispatch(documentSearchActions.setSelectedColumns(columns)),
    addSelectedColumn: (column: Column) =>
      dispatch(documentSearchActions.addSelectedColumn(column)),
    removeSelectedColumn: (column: Column) =>
      dispatch(documentSearchActions.removeSelectedColumn(column)),
    setViewModel: (viewMode: ViewMode) =>
      dispatch(documentSearchActions.setViewmode(viewMode)),
  };
}

function mapStateToProps(state: StoreState) {
  return {
    viewMode: state.documentSearch.viewMode || 'table',
    selectedColumns: state.documentSearch.selectedColumns,
    searchForSensitive:
      state.documentSearch.currentDocumentQuery.searchForSensitive,
    // isGroupSimilarResults:
    // state.search.currentDocumentQuery.isGroupSimilarResults,
  };
}

const SearchDisplayOptionPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(OptionsPanelContainer);

export default SearchDisplayOptionPanel;

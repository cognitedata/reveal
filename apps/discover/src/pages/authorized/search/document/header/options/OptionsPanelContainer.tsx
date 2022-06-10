import React from 'react';
import { connect } from 'react-redux';

import { StoreState, TS_FIX_ME } from 'core';
import sortBy from 'lodash/sortBy';

import { documentSearchActions } from 'modules/documentSearch/actions';
import { ViewMode } from 'modules/documentSearch/types';
import { getAvailableColumns } from 'modules/documentSearch/utils/getAvailableColumns';
import { Column, AvailableColumn } from 'pages/authorized/search/common/types';

import { columnMap } from '../../results/DocumentResultTable';

import OptionsPanel from './OptionsPanel';

interface Props {
  selectedColumns: string[];
  addSelectedColumn: (column: Column) => void;
  removeSelectedColumn: (column: Column) => void;
}

const availableColumns = getAvailableColumns(columnMap);

const OptionsPanelContainer: React.FC<Props> = (props) => {
  const { selectedColumns, addSelectedColumn, removeSelectedColumn } = props;

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

  const mergedColumns = availableColumns.map((availableColumn) => {
    return {
      ...availableColumn,
      selected: selectedColumns.includes(availableColumn.field),
    };
  });

  const sortedColumns = sortBy(mergedColumns, 'order');

  return (
    <OptionsPanel
      handleColumnSelection={handleColumnSelection}
      columns={sortedColumns}
    />
  );
};

function mapDispatchToProps(dispatch: TS_FIX_ME) {
  return {
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
  };
}

const SearchDisplayOptionPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(OptionsPanelContainer);

export default SearchDisplayOptionPanel;

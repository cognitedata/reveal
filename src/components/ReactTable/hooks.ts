import {
  actions,
  Hooks,
  UseTableInstanceProps,
  CellPropGetter,
  Row,
} from 'react-table';

actions.cellSelectionSelect = 'cellSelectionSelect';

// Copied from here https://codesandbox.io/s/small-sky-rigrhx?file=/src/useCellSelection.js:0-2392
export function useCellSelection<D extends object = {}>(hooks: Hooks<D>) {
  function getCellNavigationIndex(
    [row, col]: any,
    key: string,
    instance: UseTableInstanceProps<D>
  ) {
    const { rows, visibleColumns } = instance;
    const lastRow = rows.length - 1;
    const lastCol = visibleColumns.length - 1;

    if (key === 'ArrowUp' && row > 0) return [--row, col];
    if (key === 'ArrowDown' && row < lastRow) return [++row, col];
    if (key === 'ArrowLeft' && col > 0) return [row, --col];
    if (key === 'ArrowRight' && col < lastCol) return [row, ++col];

    return [row, col];
  }

  const getCellProps = (
    props: CellPropGetter<D>,
    { instance, cell }: { instance: UseTableInstanceProps<D>; cell: any }
  ) => {
    const { dispatch } = instance;

    const select = (index: [number, number]) =>
      dispatch({ type: actions.cellSelectionSelect, index });

    // Is there a way to memoize these props?
    return [
      props,
      {
        onKeyDown: (e: React.KeyboardEvent<HTMLTableSectionElement>) => {
          if (
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
          ) {
            e.preventDefault();
            const index = getCellNavigationIndex(
              cell.index,
              e.key,
              instance
            ) as [number, number];

            select(index);

            // avoid selecting cells from other tables
            const table = e.currentTarget.closest('[role="table"]');
            const element = table?.querySelector(
              `[role="cell"][data-index="${index.join('-')}"]`
            );
            element instanceof HTMLElement && element.focus();
          }
        },
        onFocus: () => {
          if (!cell.isSelected) select(cell.index);
        },
        tabIndex: 0,
        'data-index': cell.index.join('-'),
        'data-selected': cell.isSelected,
      },
    ];
  };

  function prepareRow(row: Row<D>, { instance }: { instance: any }) {
    const { state } = instance;

    row.cells.forEach((cell: any, index) => {
      cell.index = [row.index, index];
      cell.isSelected = state.selectedCells.some(
        (index: [number, number]) =>
          index[0] === cell.index[0] && index[1] === cell.index[1]
      );
    });
  }

  hooks.getCellProps.push(getCellProps as any);
  hooks.stateReducers.push(reducer);
  hooks.prepareRow.push(prepareRow);
}

useCellSelection.pluginName = 'useCellSelection';

function reducer(state: any, action: any) {
  switch (action.type) {
    case actions.init:
      return {
        ...state,
        selectedCells: [],
      };
    case actions.cellSelectionSelect:
      return {
        ...state,
        selectedCells: [action.index],
      };
    default:
      return state;
  }
}

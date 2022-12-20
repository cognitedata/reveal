import { CellPropGetter, Row } from 'react-table';

interface RowWithCustomCellProps<D extends object> extends Row<D> {
  cells: (Row<D>['cells'][number] & {
    column: Row<D>['cells'][number]['column'] & {
      cellProps?: CellPropGetter<D>;
    };
  })[];
}

export const DefaultCommonTableRow = <T extends { isSelected?: boolean }>({
  original,
  getRowProps,
  cells,
}: RowWithCustomCellProps<T>) => (
  <tr
    {...getRowProps(
      'isSelected' in original && original.isSelected
        ? {
            style: {
              background: 'var(--cogs-surface--interactive--toggled-default)',
            },
          }
        : {}
    )}
  >
    {cells.map((cell) => (
      // react-table inserts the key accordingly
      // eslint-disable-next-line react/jsx-key
      <td
        {...cell.getCellProps(cell.column?.cellProps)}
        className="cogs-body-2"
      >
        {cell.render('Cell')}
      </td>
    ))}
  </tr>
);

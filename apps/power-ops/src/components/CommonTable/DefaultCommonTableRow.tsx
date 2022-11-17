import { Row } from 'react-table';

export const DefaultCommonTableRow = <T extends object>({
  getRowProps,
  cells,
}: Row<T>) => (
  <tr {...getRowProps()}>
    {cells.map(({ getCellProps, render }) => (
      // react-table inserts the key accordingly
      // eslint-disable-next-line react/jsx-key
      <td {...getCellProps()} className="cogs-body-2">
        {render('Cell')}
      </td>
    ))}
  </tr>
);

import { CellProps } from 'react-table';

export const EmptyFilledCell = <T extends object>({
  row,
  cell,
}: CellProps<T, any>) =>
  cell.value ? (
    <>{cell.value}</>
  ) : (
    <span style={{ color: 'var(--cogs-decorative--grayscale--400)' }}>
      {row.depth === 0 && '––––'}
    </span>
  );

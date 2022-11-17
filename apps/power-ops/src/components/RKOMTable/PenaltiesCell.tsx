import { Label } from '@cognite/cogs.js';
import { CellProps } from 'react-table';

export const PenaltiesCell = <T extends object>({
  cell: { value },
  row: { depth },
}: CellProps<T, any>) => {
  if (depth === 0)
    return (
      <span style={{ color: 'var(--cogs-decorative--grayscale--400)' }}>
        ––––
      </span>
    );
  if (value)
    return (
      <Label variant="danger" size="small">
        {value}
      </Label>
    );
  return null;
};

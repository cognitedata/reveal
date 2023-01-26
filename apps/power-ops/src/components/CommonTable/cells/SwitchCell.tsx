import { Switch } from '@cognite/cogs.js-v9';
import { CellProps, Renderer } from 'react-table';

interface Props<D extends Record<string, any>> {
  property: keyof D;
  onChange: (newData: D) => void;
}

export const SwitchCell =
  <D extends object>({
    onChange,
    property,
  }: Props<D>): Renderer<CellProps<D, boolean>> =>
  ({ value, row: { original, id } }) =>
    (
      <Switch
        name={`${String(property)}-${id}`}
        title={`${String(property)}-${id}`}
        checked={value}
        onChange={(event: any, newValue: any) =>
          onChange({ ...original, [property]: newValue })
        }
      />
    );

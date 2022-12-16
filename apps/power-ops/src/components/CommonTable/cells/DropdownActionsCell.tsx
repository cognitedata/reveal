import { ContextDropdown } from 'components/ContextDropdown/ContextDropdown';
import { ComponentProps } from 'react';
import { CellProps, Renderer } from 'react-table';

interface Props<D extends object> {
  items: (original: D) => ComponentProps<typeof ContextDropdown>['items'];
  placement: ComponentProps<typeof ContextDropdown>['placement'];
}

export const DropdownActionsCell =
  <D extends object>({ items }: Props<D>): Renderer<CellProps<D, any>> =>
  ({ value, row: { original } }) =>
    (
      <ContextDropdown
        recordId={String(value)}
        dropdownMenuProps={{ style: { minWidth: 150 } }}
        items={items(original)}
      />
    );

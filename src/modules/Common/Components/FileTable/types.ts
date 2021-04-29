import { BaseTableProps } from 'react-base-table';
import { TableDataItem } from 'src/modules/Common/Types';

export type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'> & {
  onRowSelect: (id: number, selected: boolean) => void;
};

import { ColumnShape, Column } from 'react-base-table';
import { BulkEditTempState } from 'src/modules/Explorer/store/explorerSlice';
import { FileState } from '../../filesSlice';
import { BulkEditTableDataType } from './BulkEditTable/BulkEditTable';
import { getDataForLabel } from './Label/getDataForLabel';
import { LabelPanel } from './Label/LabelPanel';

export type BulkEditOptionType = {
  value: string;
  label: string;
  editPanel: ({
    bulkEditTemp,
    setBulkEditTemp,
  }: {
    bulkEditTemp: BulkEditTempState;
    setBulkEditTemp: (value: BulkEditTempState) => void;
  }) => JSX.Element;
  columns: ColumnShape[];
  data: (
    selectedFiles: FileState[],
    bulkEditTemp: BulkEditTempState
  ) => BulkEditTableDataType[];
};

export const bulkEditOptions: BulkEditOptionType[] = [
  {
    value: 'labels',
    label: 'Labels',
    editPanel: LabelPanel,
    columns: [
      {
        key: 'name',
        title: 'File name',
        dataKey: 'name',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'original',
        title: 'Original label(s)',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updated',
        title: 'Additional label(s)',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForLabel,
  },
];

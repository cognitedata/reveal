import { ColumnShape, Column } from 'react-base-table';
import { BulkEditTempState } from 'src/modules/Common/store/commonSlice';
import { FileState } from 'src/modules/Common/store/filesSlice';
import { BulkEditTableDataType } from './BulkEditTable/BulkEditTable';
import { getDataForLabel } from './Label/getDataForLabel';
import { LabelPanel } from './Label/LabelPanel';
import { getDataForMetadata } from './Metadata/getDataForMetadata';
import { MetadataPanel } from './Metadata/MetadataPanel';

export type EditPanelState = {
  metadataActiveKey?: MetadataSelectOptionType;
};

export type BulkEditOptionType = {
  value: string;
  label: string;
  EditPanel: ({
    selectedFiles,
    bulkEditTemp,
    setBulkEditTemp,
  }: EditPanelProps) => JSX.Element;
  columns: ColumnShape[];
  data: (
    selectedFiles: FileState[],
    bulkEditTemp: BulkEditTempState,
    editPanelState: EditPanelState
  ) => BulkEditTableDataType[];
};

export type MetadataSelectOptionType = { value: string; label: string };

export type EditPanelProps = {
  selectedFiles: FileState[];
  bulkEditTemp: BulkEditTempState;
  editPanelStateOptions: {
    editPanelState: EditPanelState;
    setEditPanelState: (editPanelState: EditPanelState) => void;
  };
  setBulkEditTemp: (value: BulkEditTempState) => void;
  setEditing: (option: boolean) => void;
};

export const bulkEditOptions: BulkEditOptionType[] = [
  {
    value: 'metadata',
    label: 'Metadata',
    EditPanel: MetadataPanel,
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
        title: 'Original value',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updated',
        title: 'Updated value',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForMetadata,
  },
  {
    value: 'labels',
    label: 'Labels',
    EditPanel: LabelPanel,
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

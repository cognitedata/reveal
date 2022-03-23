import { ColumnShape, Column } from 'react-base-table';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import { BulkEditTableDataType } from './BulkEditTable/BulkEditTable';
import { getDataForLabel } from './Label/getDataForLabel';
import { AnnotationPanel } from './Annotation/AnnotationPanel';
import { LabelPanel } from './Label/LabelPanel';
import { getDataForMetadata } from './Metadata/getDataForMetadata';
import { getDataForAnnotation } from './Annotation/getDataForAnnotation';
import { MetadataPanel } from './Metadata/MetadataPanel';

export type EditPanelState = {
  metadataActiveKey?: MetadataSelectOptionType;
  annotationFilterType?: AnnotationFilterType;
};

export type BulkEditOptionType = {
  value: string;
  label: string;
  popconfirmOnApply: boolean;
  tooltipContentOnDisabled?: string;
  EditPanel: ({
    selectedFiles,
    bulkEditUnsaved,
    setBulkEditUnsaved,
  }: EditPanelProps) => JSX.Element;
  columns: ColumnShape[];
  data: (
    selectedFiles: VisionFile[],
    bulkEditUnsaved: BulkEditUnsavedState,
    editPanelState: EditPanelState
  ) => BulkEditTableDataType[];
};

export type MetadataSelectOptionType = { value: string; label: string };

export type EditPanelProps = {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
  editPanelStateOptions: {
    editPanelState: EditPanelState;
    setEditPanelState: (editPanelState: EditPanelState) => void;
  };
  setBulkEditUnsaved: (value: BulkEditUnsavedState) => void;
  setEditing: (option: boolean) => void;
};

export const bulkEditOptions: BulkEditOptionType[] = [
  {
    value: 'metadata',
    label: 'Metadata',
    popconfirmOnApply: false,
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
        key: 'originalMetadata',
        title: 'Original value',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updatedMetadata',
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
    popconfirmOnApply: false,
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
        key: 'originalLabels',
        title: 'Original label(s)',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updatedLabels',
        title: 'Additional label(s)',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForLabel,
  },
  {
    value: 'deleteAnnotations',
    label: 'Delete annotations',
    popconfirmOnApply: true,
    tooltipContentOnDisabled:
      'No annotations will be deleted using the current settings',
    EditPanel: AnnotationPanel,
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
        key: 'originalAnnotations',
        title: 'Original annotation(s)',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updatedAnnotations',
        title: 'Updated annotation(s)',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForAnnotation,
  },
];

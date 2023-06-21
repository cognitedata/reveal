import { ColumnShape, Column } from 'react-base-table';

import { AnnotationPanel } from '@vision/modules/Common/Components/BulkEdit/Annotation/AnnotationPanel';
import { AssetPanel } from '@vision/modules/Common/Components/BulkEdit/Asset/AssetPanel';
import { disableAssetTable } from '@vision/modules/Common/Components/BulkEdit/Asset/disableAssetTable';
import { getDataForAssets } from '@vision/modules/Common/Components/BulkEdit/Asset/getDataForAssets';
import { BulkEditTableDataType } from '@vision/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { DirectoryPanel } from '@vision/modules/Common/Components/BulkEdit/Directory/DirectoryPanel';
import { getDataForDirectory } from '@vision/modules/Common/Components/BulkEdit/Directory/getDataForDirectory';
import { BulkEditOptions } from '@vision/modules/Common/Components/BulkEdit/enums';
// Metadata
import { getDataForLabel } from '@vision/modules/Common/Components/BulkEdit/Label/getDataForLabel';
import { LabelPanel } from '@vision/modules/Common/Components/BulkEdit/Label/LabelPanel';
import { getDataForMetadata } from '@vision/modules/Common/Components/BulkEdit/Metadata/getDataForMetadata';
import { MetadataPanel } from '@vision/modules/Common/Components/BulkEdit/Metadata/MetadataPanel';
// Label
// Asset
// Source
import { getDataForSource } from '@vision/modules/Common/Components/BulkEdit/Source/getDataForSource';
import { SourcePanel } from '@vision/modules/Common/Components/BulkEdit/Source/SourcePanel';
import { BulkEditUnsavedState } from '@vision/modules/Common/store/common/types';
import { VisionFile } from '@vision/modules/Common/store/files/types';
// Directory
// Annotation
import { AnnotationFilterType } from '@vision/modules/FilterSidePanel/types';

import { AnnotationStatusPanel } from './Annotation/AnnotationStatusPanel';
import {
  getDataForAnnotationFilteredByState,
  getDataForAnnotationsFilteredByConfidence,
} from './Annotation/getDataForAnnotation';

export type EditPanelState = {
  metadataActiveKey?: MetadataSelectOptionType;
  annotationFilterType?: AnnotationFilterType;
  annotationThresholds?: [number, number]; // [rejectedThreshold, acceptedThreshold] in range [0,1]
};

export type BulkEditOptionType = {
  value: string;
  label: string;
  columns: ColumnShape[];
  disabled?: ({
    bulkEditUnsaved,
  }: {
    bulkEditUnsaved: BulkEditUnsavedState;
  }) => boolean;
  popconfirmOnApply: boolean;
  tooltipContentOnDisabled?: string;
  EditPanel: ({
    selectedFiles,
    bulkEditUnsaved,
    setBulkEditUnsaved,
  }: EditPanelProps) => JSX.Element;
  data: ({
    selectedFiles,
    bulkEditUnsaved,
    editPanelState,
    assetsDetails,
  }: {
    selectedFiles: VisionFile[];
    bulkEditUnsaved: BulkEditUnsavedState;
    editPanelState: EditPanelState;
    assetsDetails: Record<number, { name: string }>;
  }) => BulkEditTableDataType[];
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
    label: BulkEditOptions.metadata,
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
    label: BulkEditOptions.labels,
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
    value: 'asset',
    label: BulkEditOptions.assets,
    popconfirmOnApply: false,
    EditPanel: AssetPanel,
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
        key: 'originalAssets',
        title: 'Original asset name(s)',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updatedAssets',
        title: 'Updated asset name(s)',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForAssets,
    disabled: disableAssetTable,
  },
  {
    value: 'source',
    label: 'Source',
    popconfirmOnApply: false,
    EditPanel: SourcePanel,
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
        key: 'originalSource',
        title: 'Original source(s)',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updatedSource',
        title: 'Updated source(s)',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForSource,
  },
  {
    value: 'directory',
    label: 'Directory',
    popconfirmOnApply: false,
    EditPanel: DirectoryPanel,
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
        key: 'originalDirectory',
        title: 'Original directory',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updatedDirectory',
        title: 'Updated directory',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForDirectory,
  },
  {
    value: 'deleteAnnotations',
    label: BulkEditOptions.deleteAnnotations,
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
    data: getDataForAnnotationFilteredByState,
  },
  {
    value: 'editAnnotationStatus',
    label: 'Annotation status',
    popconfirmOnApply: false,
    EditPanel: AnnotationStatusPanel,
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
        key: 'originalAnnotationStatuses',
        title: 'Original statuses',
        dataKey: 'original',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
      {
        key: 'updatedAnnotationStatuses',
        title: 'Updated statuses',
        dataKey: 'updated',
        width: 300,
        align: Column.Alignment.LEFT,
        editMode: false,
      },
    ],
    data: getDataForAnnotationsFilteredByConfidence,
  },
];

import React, { useEffect } from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { ResultData, TableDataItem } from 'src/modules/Common/types';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { SelectableTable } from 'src/modules/Common/Components/SelectableTable/SelectableTable';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { ActionRendererExplorer } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { DateSorter } from 'src/modules/Common/Containers/Sorters/DateSorter';
import { DateRenderer } from 'src/modules/Common/Containers/FileTableRenderers/DateRenderer';
import { NameSorter } from 'src/modules/Common/Containers/Sorters/NameSorter';
import { AnnotationLoader } from 'src/modules/Common/Components/AnnotationLoader/AnnotationLoader';
import { useDispatch, useSelector } from 'react-redux';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { setLoadingAnnotations } from 'src/modules/Explorer/store/explorerSlice';
import { RootState } from 'src/store/rootReducer';
import { FileListTableProps, PaginatedTableProps } from './types';
import { SorterPaginationWrapper } from '../SorterPaginationWrapper/SorterPaginationWrapper';
import { MimeTypeSorter } from '../../Containers/Sorters/MimeTypeSorter';
import { AnnotationSorter } from '../../Containers/Sorters/AnnotationSorter';

const rendererMap = {
  name: NameRenderer,
  mimeType: StringRenderer,
  sourceCreatedTime: DateRenderer,
  annotations: AnnotationRenderer,
  action: ActionRendererExplorer,
};

const sorters = {
  name: NameSorter,
  mimeType: MimeTypeSorter,
  sourceCreatedTime: DateSorter,
  annotations: AnnotationSorter,
};

export function FileTableExplorer(props: FileListTableProps) {
  const columns: ColumnShape<TableDataItem>[] = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
      sortable: true,
    },
    {
      key: 'mimeType',
      title: 'Mime Type',
      dataKey: 'mimeType',
      width: 150,
      align: Column.Alignment.LEFT,
      sortable: true,
    },
    ...(!props.modalView
      ? [
          {
            key: 'sourceCreatedTime',
            title: 'Source Created Time',
            dataKey: 'sourceCreatedTime',
            align: Column.Alignment.LEFT,
            width: 250,
            sortable: true,
          },
        ]
      : []),

    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.LEFT,
      sortable: true,
    },
    ...(!props.modalView
      ? [
          {
            key: 'action',
            title: '',
            dataKey: 'menu',
            align: Column.Alignment.RIGHT,
            width: 200,
          },
        ]
      : []),
  ];

  const rowClassNames = ({
    rowData,
  }: {
    columns: ColumnShape<TableDataItem>[];
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    return `clickable ${props.selectedFileId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onRowClick(rowData as ResultData);
    },
  };

  const loadingAnnotations = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.loadingAnnotations
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (props.sortPaginateControls.sortKey === 'annotations') {
      const fileIds = props.data.map((item) => item.id);
      dispatch(setLoadingAnnotations());
      dispatch(RetrieveAnnotations(fileIds));
    }
  }, [props.sortPaginateControls.sortKey]);

  return (
    <SorterPaginationWrapper
      data={props.data}
      totalCount={props.totalCount}
      sorters={sorters}
      pagination
      sortPaginateControls={props.sortPaginateControls}
    >
      {(paginationProps: PaginatedTableProps<TableDataItem>) => {
        if (props.sortPaginateControls.sortKey === 'annotations') {
          return (
            <SelectableTable
              {...props}
              {...paginationProps}
              columns={columns}
              rendererMap={rendererMap}
              selectable
              rowClassNames={rowClassNames}
              rowEventHandlers={rowEventHandlers}
              disabled={loadingAnnotations}
            />
          );
        }
        return (
          <AnnotationLoader data={paginationProps.data}>
            <SelectableTable
              {...props}
              {...paginationProps}
              columns={columns}
              rendererMap={rendererMap}
              selectable
              rowClassNames={rowClassNames}
              rowEventHandlers={rowEventHandlers}
              disabled={loadingAnnotations}
            />
          </AnnotationLoader>
        );
      }}
    </SorterPaginationWrapper>
  );
}

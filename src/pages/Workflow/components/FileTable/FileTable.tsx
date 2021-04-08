import React from 'react';
import { TimeDisplay } from '@cognite/data-exploration';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';

import { Popover } from 'src/components/Common/Popover';
import { AnnotationsBadgeProps } from 'src/pages/Workflow/types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { useAnnotationCounter } from 'src/store/hooks/useAnnotationCounter';
import { selectJobsByFileId } from 'src/store/processSlice';
import { TableWrapper } from './FileTableWrapper';
import { AnnotationsBadge } from '../AnnotationsBadge/AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from '../AnnotationsBadge/AnnotationsBadgePopoverContent';

export type FileActions = {
  showMetadataPreview: (fileId: number) => void;
  onReviewClick?: (fileId: number) => void;
};

export type TableDataItem = {
  id: number;
  mimeType: string;
  name: string;
  menu: FileActions;
};

type CellRenderer = {
  rowData: TableDataItem;
};

type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'>;

function StatusRendrer(
  { rowData: { id } }: CellRenderer,
  annotationsBadgeProps: AnnotationsBadgeProps
) {
  const annotations = Object.keys(annotationsBadgeProps) as Array<
    keyof AnnotationsBadgeProps
  >;

  const jobs = useSelector((state: RootState) =>
    selectJobsByFileId(state.processSlice, id)
  );
  if (
    annotations.some(
      (key) => annotationsBadgeProps[key]?.status === 'Completed'
    ) &&
    !annotations.some((key) =>
      ['Running', 'Queued'].includes(annotationsBadgeProps[key]?.status || '')
    )
  ) {
    let statusTime = 0;
    if (jobs.length) {
      statusTime = Math.max(...jobs.map((job) => job.statusTime));
    }

    return (
      <div>
        Processed <TimeDisplay value={statusTime} relative withTooltip />
      </div>
    );
  }
  if (
    annotations.some((key) => annotationsBadgeProps[key]?.status === 'Running')
  ) {
    return <div style={{ textTransform: 'capitalize' }}>Running</div>;
  }

  if (
    annotations.some((key) => annotationsBadgeProps[key]?.status === 'Queued')
  ) {
    return <div style={{ textTransform: 'capitalize' }}>Queued</div>;
  }

  return <div style={{ textTransform: 'capitalize' }}>Unprocessed</div>;
}

function AnnotationRendrer(annotationsBadgeProps: AnnotationsBadgeProps) {
  return (
    <Popover
      placement="bottom"
      trigger="click"
      content={AnnotationsBadgePopoverContent(annotationsBadgeProps)}
    >
      <>{AnnotationsBadge(annotationsBadgeProps)}</>
    </Popover>
  );
}

function ActionRendrer(
  { rowData: { menu, id } }: CellRenderer,
  annotationsBadgeProps: AnnotationsBadgeProps
) {
  const handleMetadataEdit = () => {
    if (menu?.showMetadataPreview) {
      menu.showMetadataPreview(id);
    }
  };

  // todo: bind actions
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item onClick={handleMetadataEdit}>Edit metadata</Menu.Item>
      <Menu.Item>Delete</Menu.Item>
    </Menu>
  );

  const handleReview = () => {
    if (menu?.onReviewClick) {
      menu.onReviewClick(id);
    }
  };
  const annotations = Object.keys(annotationsBadgeProps) as Array<
    keyof AnnotationsBadgeProps
  >;
  const reviewDisabled = annotations.some((key) =>
    ['Queued', 'Running'].includes(annotationsBadgeProps[key]?.status || '')
  );

  return (
    <div>
      <Button
        type="secondary"
        icon="ArrowRight"
        iconPlacement="right"
        style={{ marginRight: '10px' }}
        onClick={handleReview}
        disabled={reviewDisabled}
      >
        Review
      </Button>
      <Dropdown content={MenuContent}>
        <Button type="secondary" icon="MoreOverflowEllipsisHorizontal" />
      </Dropdown>
    </div>
  );
}

function stringRenderer(cellProps: { cellData: string }) {
  return <div>{cellProps.cellData}</div>;
}

export function FileTable(props: FileTableProps) {
  console.log('Render table');

  const Cell = (cellProps: any) => {
    console.log('Calling cell rendrers');

    if (['status', 'annotations', 'action'].includes(cellProps.column.key)) {
      const annotationsBadgeProps = useAnnotationCounter(cellProps.rowData.id);

      if (cellProps.column.key === 'status') {
        return StatusRendrer(cellProps, annotationsBadgeProps);
      }
      if (cellProps.column.key === 'annotations') {
        return AnnotationRendrer(annotationsBadgeProps);
      }
      if (cellProps.column.key === 'action') {
        return ActionRendrer(cellProps, annotationsBadgeProps);
      }
    }

    return stringRenderer(cellProps);
  };

  const components = {
    TableCell: Cell,
  };

  const columns: ColumnShape<TableDataItem>[] = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
    },
    {
      key: 'mimeType',
      title: 'Mime Type',
      dataKey: 'mimeType',
      width: 100,
    },
    {
      key: 'status',
      title: 'Status',
      width: 250,
      align: Column.Alignment.CENTER,
    },
    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.CENTER,
    },
    {
      key: 'action',
      title: 'File Actions',
      dataKey: 'menu',
      align: Column.Alignment.CENTER,
      width: 200,
    },
  ];

  return (
    <TableWrapper>
      <AutoSizer style={{ width: 'auto', height: 'auto' }}>
        {({ width }) => (
          <ReactBaseTable<TableDataItem>
            columns={columns}
            maxHeight={Infinity}
            width={width}
            components={components}
            {...props}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
}

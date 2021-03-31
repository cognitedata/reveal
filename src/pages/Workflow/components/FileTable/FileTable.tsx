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
  statusTime: number;
  menu: FileActions;
  annotationsBadgeProps: AnnotationsBadgeProps;
};

type CellRenderer = {
  rowData: TableDataItem;
};

type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'>;

function StatusCell({
  rowData: { annotationsBadgeProps: badgeProps, statusTime },
}: CellRenderer) {
  const annotations = Object.keys(badgeProps) as Array<
    keyof AnnotationsBadgeProps
  >;
  if (
    annotations.some((key) => badgeProps[key]?.status === 'Completed') &&
    !annotations.some((key) =>
      ['Running', 'Queued'].includes(badgeProps[key]?.status || '')
    )
  ) {
    return (
      <div>
        Processed <TimeDisplay value={statusTime} relative withTooltip />
      </div>
    );
  }
  if (annotations.some((key) => badgeProps[key]?.status === 'Running')) {
    return <div style={{ textTransform: 'capitalize' }}>Running</div>;
  }

  if (annotations.some((key) => badgeProps[key]?.status === 'Queued')) {
    return <div style={{ textTransform: 'capitalize' }}>Queued</div>;
  }

  return <div style={{ textTransform: 'capitalize' }}>Unprocessed</div>;
}

function ActionCell({ rowData }: CellRenderer) {
  const { menu } = rowData;

  const handleMetadataEdit = () => {
    if (menu?.showMetadataPreview) {
      menu.showMetadataPreview(rowData.id);
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
      menu.onReviewClick(rowData.id);
    }
  };

  return (
    <div>
      <Button
        type="secondary"
        icon="ArrowRight"
        iconPlacement="right"
        style={{ marginRight: '10px' }}
        onClick={handleReview}
      >
        Review
      </Button>
      <Dropdown content={MenuContent}>
        <Button type="secondary" icon="MoreOverflowEllipsisHorizontal" />
      </Dropdown>
    </div>
  );
}

export function FileTable(props: FileTableProps) {
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
      // ML processing job status: Queued, In Progress, Processed <DateTime>
      cellRenderer: StatusCell,
    },
    {
      key: 'annotations',
      title: 'Annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.CENTER,
      // ML based or custom annotations count for the file
      cellRenderer: ({
        rowData: { annotationsBadgeProps: annotationCellProps },
      }: CellRenderer) => {
        return (
          annotationCellProps && (
            <Popover
              placement="bottom"
              trigger="click"
              content={AnnotationsBadgePopoverContent(annotationCellProps)}
            >
              <>{AnnotationsBadge(annotationCellProps)}</>
            </Popover>
          )
        );
      },
    },
    {
      key: 'action',
      title: 'File Actions',
      dataKey: 'menu',
      align: Column.Alignment.CENTER,
      width: 200,
      cellRenderer: ActionCell,
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
            {...props}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
}

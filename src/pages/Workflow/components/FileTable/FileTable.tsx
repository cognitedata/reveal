import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import React from 'react';

import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';
import { TimeDisplay } from '@cognite/data-exploration';
import { TableWrapper } from './FileTableWrapper';
import {
  AnnotationStatusAndCount,
  DetectionModelStatusAndCount,
} from '../../types';

export type FileActions = {
  annotationsAvailable: boolean;
  onAnnotationEditClick?: () => void;
  showMetadataPreview: (fileId: number) => void;
  onReviewClick?: (fileId: number) => void;
};

export type TableDataItem = {
  id: number;
  mimeType: string;
  name: string;
  statusTime: number;
  menu: FileActions;
  annotationsCount: number;
  annotationStatus: AnnotationStatusAndCount;
};

type CellRenderer = {
  rowData: TableDataItem;
};

type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'>;

function AnnotationCell({ rowData }: CellRenderer) {
  const setBadge = ({ status, count }: DetectionModelStatusAndCount) => {
    if (status === 'Running') {
      return <Icon type="Loading" />;
    }
    if (count !== undefined && status !== 'Queued') {
      return String(count);
    }
    return '–';
  };
  const setOpacity = (status: string | undefined) =>
    status === 'Completed' || status === 'Running' ? 1.0 : 0.5;
  return (
    <div>
      {rowData.annotationStatus.gdprDetctionStatus.status && (
        <Button
          icon="WarningFilled"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#FBE9ED',
            color: '#B30539',
            opacity: setOpacity(
              rowData.annotationStatus.gdprDetctionStatus.status
            ),
          }}
        >
          {setBadge(rowData.annotationStatus.gdprDetctionStatus)}
        </Button>
      )}
      {rowData.annotationStatus.tagDetctionStatus.status && (
        <Button
          icon="Link"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#F4DAF8',
            color: '#C945DB',
            opacity: setOpacity(
              rowData.annotationStatus.tagDetctionStatus.status
            ),
          }}
        >
          {setBadge(rowData.annotationStatus.tagDetctionStatus)}{' '}
        </Button>
      )}
      {rowData.annotationStatus.genericDetctionStatus.status && (
        <Button
          icon="Scan"
          size="small"
          style={{
            backgroundColor: '#E8E8E8',
            opacity: setOpacity(
              rowData.annotationStatus.genericDetctionStatus.status
            ),
          }}
        >
          {setBadge(rowData.annotationStatus.genericDetctionStatus)}
        </Button>
      )}
    </div>
  );
}

function StatusCell({
  rowData: { annotationStatus, statusTime },
}: CellRenderer) {
  const annotations = Object.keys(annotationStatus) as Array<
    keyof AnnotationStatusAndCount
  >;
  if (
    annotations.some((key) => annotationStatus[key].status === 'Completed') &&
    !annotations.some((key) =>
      ['Running', 'Queued'].includes(annotationStatus[key].status)
    )
  ) {
    return (
      <div>
        Processed <TimeDisplay value={statusTime} relative withTooltip />
      </div>
    );
  }
  if (annotations.some((key) => annotationStatus[key].status === 'Running')) {
    return <div style={{ textTransform: 'capitalize' }}>Running</div>;
  }

  if (annotations.some((key) => annotationStatus[key].status === 'Queued')) {
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
      cellRenderer: AnnotationCell,
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

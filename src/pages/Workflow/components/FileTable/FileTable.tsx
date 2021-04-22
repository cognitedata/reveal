import React, { useMemo } from 'react';
import { TimeDisplay } from '@cognite/data-exploration';
import { Button, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';

import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';
import exifIcon from 'src/assets/exifIcon.svg';
import { Popover } from 'src/components/Common/Popover';
import { AnnotationsBadgeProps } from 'src/pages/Workflow/types';
import styled from 'styled-components';
import { selectUpdatedFileDetails } from 'src/store/uploadedFilesSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { makeAnnotationBadgePropsByFileId } from 'src/store/processSlice';
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

export type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'width'>;

function StatusRendrer({ rowData: { id } }: CellRenderer) {
  const selectAnnotationBadgeProps = useMemo(
    makeAnnotationBadgePropsByFileId,
    []
  );
  const annotationsBadgeProps = useSelector((state: RootState) =>
    selectAnnotationBadgeProps(state, id)
  );

  const annotations = Object.keys(annotationsBadgeProps) as Array<
    keyof AnnotationsBadgeProps
  >;

  if (
    annotations.some(
      (key) => annotationsBadgeProps[key]?.status === 'Completed'
    ) &&
    !annotations.some((key) =>
      ['Running', 'Queued'].includes(annotationsBadgeProps[key]?.status || '')
    )
  ) {
    let statusTime = 0;
    if (annotations.length) {
      statusTime = Math.max(
        ...annotations.map((key) => annotationsBadgeProps[key]?.statusTime || 0)
      );
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

function AnnotationRendrer({ rowData: { id } }: CellRenderer) {
  const selectAnnotationBadgeProps = useMemo(
    makeAnnotationBadgePropsByFileId,
    []
  );
  const annotationsBadgeProps = useSelector((state: RootState) =>
    selectAnnotationBadgeProps(state, id)
  );
  return (
    <Popover
      placement="bottom"
      trigger="mouseenter click"
      content={AnnotationsBadgePopoverContent(annotationsBadgeProps)}
    >
      <>{AnnotationsBadge(annotationsBadgeProps)}</>
    </Popover>
  );
}

function NameRenderer({ rowData: { name, id } }: CellRenderer) {
  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, String(id))
  );
  return (
    <FileRow>
      <FileNameText>{name}</FileNameText>
      {fileDetails?.geoLocation && (
        <Tooltip content="EXIF data added">
          <ExifIcon>
            <img src={exifIcon} alt="exifIcon" />
          </ExifIcon>
        </Tooltip>
      )}
    </FileRow>
  );
}

function ActionRendrer({ rowData: { menu, id } }: CellRenderer) {
  const selectAnnotationBadgeProps = useMemo(
    makeAnnotationBadgePropsByFileId,
    []
  );
  const annotationsBadgeProps = useSelector((state: RootState) =>
    selectAnnotationBadgeProps(state, id)
  );

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
      <Menu.Item onClick={handleMetadataEdit}>Edit file details</Menu.Item>
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
    <Action>
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
        <Button
          type="secondary"
          icon="MoreOverflowEllipsisHorizontal"
          aria-label="dropdown button"
        />
      </Dropdown>
    </Action>
  );
}

function stringRenderer(cellProps: { cellData: string }) {
  return <div>{cellProps.cellData}</div>;
}

export function FileTable(props: FileTableProps) {
  const Cell = (cellProps: any) => {
    if (cellProps.column.key === 'name') {
      return NameRenderer(cellProps);
    }
    if (cellProps.column.key === 'status') {
      return StatusRendrer(cellProps);
    }
    if (cellProps.column.key === 'annotations') {
      return AnnotationRendrer(cellProps);
    }
    if (cellProps.column.key === 'action') {
      return ActionRendrer(cellProps);
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
      <AutoSizer
        style={{
          width: 'auto',
        }}
      >
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

export const Action = styled.div`
  display: flex;
  align-items: flex-end;
`;

export const FileRow = styled.div`
  display: flex;
  flex: 1 1 auto;
  height: inherit;
  width: inherit;
  align-items: center;
`;

export const FileNameText = styled.div`
  display: flex;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 0 1 auto;
  display: inline-block;
`;

export const ExifIcon = styled.div`
  display: flex;
  padding-bottom: 15px;
  padding-right: 0px;
  padding-left: 0px;
  flex: 0 0 auto;
`;

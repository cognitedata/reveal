import React from 'react';
import { Button, Title, Dropdown, Icon, Menu, Body } from '@cognite/cogs.js';
import { TimeDisplay, Divider } from '@cognite/data-exploration';

import AutoSizer from 'react-virtualized-auto-sizer';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';

import styled from 'styled-components';
import { TableWrapper } from './FileTableWrapper';
import {
  AnnotationStatusAndCount,
  DetectionModelStatusAndCount,
} from '../../types';
import { Popover } from './Popover';

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

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas: 'icon name name . count';
  padding-bottom: 23px;
`;

const GridIcon = styled.div`
  grid-area: icon;
`;

const GridName = styled.div`
  grid-area: name;
`;
const GridCount = styled.div`
  grid-area: count;
`;

function PopoverContent(
  gdprDetctionStatus: DetectionModelStatusAndCount,
  tagDetctionStatus: DetectionModelStatusAndCount,
  genericDetctionStatus: DetectionModelStatusAndCount
) {
  return (
    <>
      <Body level={1}> Detections </Body>
      <Divider.Horizontal />
      {gdprDetctionStatus.status && (
        <GridLayout>
          <GridIcon>
            <Button
              icon="WarningStroke"
              size="small"
              style={{
                marginRight: '5px',
                backgroundColor: '#FBE9ED',
                color: '#B30539',
                borderRadius: '15px',
              }}
            />
          </GridIcon>
          <GridName>
            <Title level={5}> GDPR </Title>
          </GridName>
          <GridCount style={{ color: '#B30539' }}>
            [
            {gdprDetctionStatus.count !== undefined
              ? gdprDetctionStatus.count
              : '–'}
            ]
          </GridCount>
        </GridLayout>
      )}
      {tagDetctionStatus.status && (
        <GridLayout>
          <GridIcon>
            <Button
              icon="Link"
              size="small"
              style={{
                marginRight: '5px',
                backgroundColor: '#F4DAF8',
                color: '#C945DB',
                borderRadius: '15px',
              }}
            />
          </GridIcon>
          <GridName>
            <Title level={5}> Assets </Title>
          </GridName>
          <GridCount style={{ color: '#C945DB' }}>
            [
            {tagDetctionStatus.count !== undefined
              ? tagDetctionStatus.count
              : '–'}
            ]
          </GridCount>
        </GridLayout>
      )}

      {genericDetctionStatus.status && (
        <GridLayout>
          <GridIcon>
            <Button
              icon="Scan"
              size="small"
              style={{
                marginRight: '5px',
                backgroundColor: '#E8E8E8',
                borderRadius: '15px',
              }}
            />
          </GridIcon>
          <GridName>
            <Title level={5}> Genric </Title>
          </GridName>
          <GridCount>
            [
            {genericDetctionStatus.count !== undefined
              ? genericDetctionStatus.count
              : '–'}
            ]
          </GridCount>
        </GridLayout>
      )}
    </>
  );
}

function AnnotationCell({
  rowData: {
    annotationStatus: {
      gdprDetctionStatus,
      tagDetctionStatus,
      genericDetctionStatus,
    },
  },
}: CellRenderer) {
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
    <Popover
      placement="bottom"
      trigger="click"
      content={PopoverContent(
        gdprDetctionStatus,
        tagDetctionStatus,
        genericDetctionStatus
      )}
    >
      <>
        {gdprDetctionStatus.status && (
          <Button
            icon="WarningFilled"
            size="small"
            style={{
              marginRight: '5px',
              backgroundColor: '#FBE9ED',
              color: '#B30539',
              opacity: setOpacity(gdprDetctionStatus.status),
            }}
          >
            {setBadge(gdprDetctionStatus)}
          </Button>
        )}
        {tagDetctionStatus.status && (
          <Button
            icon="Link"
            size="small"
            style={{
              marginRight: '5px',
              backgroundColor: '#F4DAF8',
              color: '#C945DB',
              opacity: setOpacity(tagDetctionStatus.status),
            }}
          >
            {setBadge(tagDetctionStatus)}
          </Button>
        )}
        {genericDetctionStatus.status && (
          <Button
            icon="Scan"
            size="small"
            style={{
              backgroundColor: '#E8E8E8',
              opacity: setOpacity(genericDetctionStatus.status),
            }}
          >
            {setBadge(genericDetctionStatus)}
          </Button>
        )}
      </>
    </Popover>
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

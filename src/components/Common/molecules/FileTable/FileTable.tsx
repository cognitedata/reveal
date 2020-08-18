import React, { useEffect, useState } from 'react';
import { FilesMetadata as File } from '@cognite/sdk';
import Table, { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import AutoSizer from 'react-virtualized-auto-sizer';
import TableStyle from 'react-base-table/styles.css';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import Highlighter from 'react-highlight-words';
import { TableWrapper } from 'components/Common';
import moment from 'moment';

const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

const ActionCell = ({ file }: { file: File }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: file.id, type: 'files' });
};

export const FileTable = ({
  files,
  query,
  onFileClicked,
}: {
  files: File[];
  query?: string;
  onFileClicked: (file: File) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const mode = useResourceMode();
  const resourcesState = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');
  useEffect(() => {
    TableStyle.use();
    return () => TableStyle.unuse();
  }, []);

  const onFileSelected = (file: File) => {
    onFileClicked(file);
    setPreviewId(file.id);
  };

  return (
    <TableWrapper>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            rowEventHandlers={{
              onClick: ({ rowData: file, event }) => {
                onFileSelected(file);
                return event;
              },
            }}
            rowClassName={({ rowData }) => {
              const extraClasses: string[] = [];
              if (previewId === rowData.id) {
                extraClasses.push('previewing');
              }
              if (currentItems.some(el => el.id === rowData.id)) {
                extraClasses.push('active');
              }
              return `row clickable ${extraClasses.join(' ')}`;
            }}
            width={width}
            height={height}
            columns={[
              {
                key: 'name',
                title: 'Name',
                dataKey: 'name',
                headerRenderer,
                width: 300,
                resizable: true,
                cellRenderer: ({ cellData: name }: { cellData: string }) => (
                  <Body level={2} strong>
                    <Highlighter
                      searchWords={(query || '').split(' ')}
                      textToHighlight={name}
                    />
                  </Body>
                ),
                frozen: Column.FrozenDirection.LEFT,
              },
              {
                key: 'mimeType',
                title: 'Mime Type',
                dataKey: 'mimeType',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: mimeType,
                }: {
                  cellData?: string;
                }) => <Body level={2}>{mimeType}</Body>,
                resizable: true,
              },
              {
                key: 'uploadedTime',
                title: 'Uploaded Time',
                width: 200,
                headerRenderer,
                cellRenderer: ({ cellData: file }: { cellData: File }) => (
                  <Body level={2}>
                    {file &&
                      file.uploaded &&
                      moment(file.uploadedTime).format('YYYY-MM-DD, hh:mm')}
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'lastUpdatedTime',
                title: 'Last Updated Time',
                dataKey: 'lastUpdatedTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: lastUpdatedTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    {moment(lastUpdatedTime).format('YYYY-MM-DD, hh:mm')}
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'createdTime',
                title: 'Created Time',
                dataKey: 'createdTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: createdTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    {moment(createdTime).format('YYYY-MM-DD, hh:mm')}
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'labels',
                title: 'Labels',
                width: 200,
                resizable: true,
                headerRenderer,
                cellRenderer: () => <Body level={3}>Coming soon....</Body>,
              },
              ...(mode !== 'none'
                ? [
                    {
                      key: 'action',
                      title: 'Select',
                      width: 80,
                      resizable: true,
                      align: Column.Alignment.CENTER,
                      frozen: Column.FrozenDirection.RIGHT,
                      headerRenderer,
                      cellRenderer: ({ rowData: file }: { rowData: File }) => {
                        return <ActionCell file={file} />;
                      },
                    },
                  ]
                : []),
            ]}
            fixed
            data={files}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
};

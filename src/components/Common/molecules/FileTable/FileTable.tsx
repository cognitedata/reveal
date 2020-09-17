import React, { useState } from 'react';
import { FileInfo as File } from 'cognite-sdk-v3';
import Table, { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import Highlighter from 'react-highlight-words';
import { TableWrapper, TimeDisplay } from 'components/Common';

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
  return getButton({ id: file.id, type: 'file' });
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
                cellProps: { query },
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
                title: 'Uploaded',
                width: 200,
                headerRenderer,
                cellRenderer: ({ cellData: file }: { cellData: File }) => (
                  <Body level={2}>
                    {file && file.uploaded && (
                      <TimeDisplay
                        value={file.uploadedTime}
                        relative
                        withTooltip
                      />
                    )}
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'lastUpdatedTime',
                title: 'Last updated',
                dataKey: 'lastUpdatedTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: lastUpdatedTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={lastUpdatedTime} relative withTooltip />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'createdTime',
                title: 'Created',
                dataKey: 'createdTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: createdTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={createdTime} relative withTooltip />
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

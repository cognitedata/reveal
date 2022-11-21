import React from 'react';
import styled from 'styled-components';
import { FileInfo } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { dateSorter, stringCompare } from 'utils/utils';
import { Flex, IconButton, Popover, Dropdown } from 'components/Common';
import { FileSmallPreview } from 'components/FileSmallPreview';
import { FileWithAnnotations } from 'hooks';
import DiagramReviewStatus from 'components/DiagramReviewStatus';
import InteractiveIcon from 'components/InteractiveIcon';
import DetectedTags from 'components/DetectedTags';
import { sortFilesByAnnotations } from './utils';
import { FileContextMenu } from './FileContextMenu';

const ActionsButtons = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;

export const getColumns = (onFileView: (file: FileInfo) => void) =>
  [
    {
      title: 'Name',
      key: 'name',
      render: (file: FileInfo) => (
        <Flex row align style={{ justifyContent: 'flex-start' }}>
          <Popover
            content={<FileSmallPreview fileId={file.id} />}
            onVisibleChange={(visible) =>
              visible && trackUsage(PNID_METRICS.landingPage.previewFile)
            }
          >
            <Flex align justify>
              <InteractiveIcon />
            </Flex>
          </Popover>
          <Button
            style={{ fontWeight: 500, marginLeft: '12px' }}
            onClick={() => onFileView(file)}
          >
            {file.name ?? '—'}
          </Button>
        </Flex>
      ),
      sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      render: (_: any, file: FileInfo) => (
        <DiagramReviewStatus fileId={file.id} size="medium" />
      ),
    },
    {
      title: 'Linked to',
      key: 'tags',
      render: (_: any, file: FileInfo) => <DetectedTags fileId={file.id} />,
      sorter: (a: FileWithAnnotations, b: FileWithAnnotations) =>
        sortFilesByAnnotations(a, b),
    },

    {
      title: 'Last modified',
      dataIndex: 'lastUpdatedTime',
      key: 'lastUpdatedTime',
      render: (date: string) => {
        return <div>{new Date(date).toLocaleDateString()}</div>;
      },
      sorter: dateSorter((x: any) => x?.lastUpdatedTime!),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '100px',
      align: 'center' as 'center',
      render: (file: FileInfo) => {
        return (
          <ActionsButtons row align>
            <IconButton
              aria-label="Icon-Button"
              icon="EyeShow"
              type="ghost"
              $square
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation();
                onFileView(file);
              }}
            />
            <Dropdown content={<FileContextMenu file={file} />} />
          </ActionsButtons>
        );
      },
    },
  ] as any;

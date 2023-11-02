import React from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import { FileSmallPreview } from '@data-exploration-components';

import { Flex, Popover, Dropdown } from '../../../components/Common';
import DetectedTags from '../../../components/DetectedTags';
import DiagramReviewStatus from '../../../components/DiagramReviewStatus';
import InteractiveIcon from '../../../components/InteractiveIcon';
import { trackUsage, PNID_METRICS } from '../../../utils/Metrics';
import { dateSorter, stringCompare } from '../../../utils/utils';

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
    },

    {
      title: 'Last modified',
      dataIndex: 'lastUpdatedTime',
      key: 'lastUpdatedTime',
      render: (date: string) => {
        return <div>{new Date(date).toLocaleDateString()}</div>;
      },
      sorter: dateSorter((x: any) => x?.lastUpdatedTime),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '100px',
      align: 'center' as const,
      render: (file: FileInfo) => {
        return (
          <ActionsButtons row align>
            <Button
              aria-label="View file"
              icon="EyeShow"
              type="ghost"
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

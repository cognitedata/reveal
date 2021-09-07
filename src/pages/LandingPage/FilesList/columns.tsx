import React, { SyntheticEvent } from 'react';
import styled from 'styled-components';
import { Button, Dropdown } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import { Flex, IconButton, Popover, DropdownMenu } from 'components/Common';
import { FileSmallPreview } from 'components/FileSmallPreview';
import { FileWithAnnotations } from 'hooks/useFileWithAnnotations';
import ReviewStatus from 'components/ReviewStatus';
import InteractiveIcon from 'components/InteractiveIcon';
import DetectedTags from 'components/DetectedTags';
import { sortFilesByAnnotations } from './utils';

const SettingButtons = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;

type ContextMenuProps = {
  onApproveFile: (e: SyntheticEvent) => void;
  onRejectTags: (e: SyntheticEvent) => void;
  onClearTags: (e: SyntheticEvent) => void;
  onEditFile: (e: SyntheticEvent) => void;
};

const buttonStyle = {
  width: '100%',
};
const FileContextMenu = ({
  onApproveFile,
  onRejectTags,
  onClearTags,
  onEditFile,
}: ContextMenuProps) => {
  return (
    <DropdownMenu column justify grow style={{ width: '250px' }}>
      <Button
        icon="Refresh"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onEditFile}
        type="ghost"
      >
        Recontextualize diagram
      </Button>
      <Button
        icon="Checkmark"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onApproveFile}
        type="ghost"
      >
        Approve pending tags
      </Button>
      <Button
        icon="XLarge"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onRejectTags}
        type="ghost-danger"
      >
        Reject pending tags
      </Button>
      <Button
        icon="Trash"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onClearTags}
        type="ghost-danger"
      >
        Clear all tags
      </Button>
    </DropdownMenu>
  );
};

export const getColumns = (
  onFileEdit: (file: FileInfo) => void,
  onFileView: (file: FileInfo) => void,
  onClearAnnotations: (file: FileInfo) => void,
  onApproveTags: (file: FileInfo) => void,
  onRejectTags: (file: FileInfo) => void
) => [
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
          <InteractiveIcon />
          <span style={{ fontWeight: 500, marginLeft: '12px' }}>
            {file.name ?? '—'}
          </span>
        </Popover>
      </Flex>
    ),
    sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
  },
  {
    title: 'Status',
    key: 'status',
    width: 150,
    render: (_: any, file: FileInfo) => <ReviewStatus file={file} />,
  },
  {
    title: 'Linked to',
    key: 'tags',
    render: (row: FileWithAnnotations) => <DetectedTags fileId={row.id} />,
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
    title: 'Settings',
    key: 'settings',
    width: '100px',
    align: 'center' as 'center',
    render: (file: FileInfo) => {
      return (
        <SettingButtons row align>
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
          <Dropdown
            content={
              <FileContextMenu
                onEditFile={(event) => {
                  event.stopPropagation();
                  onFileEdit(file);
                }}
                onApproveFile={() => onApproveTags(file)}
                onClearTags={() => onClearAnnotations(file)}
                onRejectTags={() => onRejectTags(file)}
              />
            }
          >
            <IconButton
              aria-label="Icon-Button"
              icon="MoreOverflowEllipsisHorizontal"
              type="ghost"
              $square
            />
          </Dropdown>
        </SettingButtons>
      );
    },
  },
];

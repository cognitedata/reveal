import React, { SyntheticEvent } from 'react';
import styled from 'styled-components';
import { FileInfo } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import {
  Flex,
  IconButton,
  Popover,
  Dropdown,
  DropdownMenu,
  MenuButton,
} from 'components/Common';
import { FileSmallPreview } from 'components/FileSmallPreview';
import { FileWithAnnotations } from 'hooks';
import DiagramReviewStatus from 'components/DiagramReviewStatus';
import InteractiveIcon from 'components/InteractiveIcon';
import DetectedTags from 'components/DetectedTags';
import { sortFilesByAnnotations } from './utils';

const ActionsButtons = styled(Flex)`
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
      <MenuButton
        icon="Refresh"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onEditFile}
        type="ghost"
      >
        Recontextualize diagram
      </MenuButton>
      <MenuButton
        icon="Checkmark"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onApproveFile}
        type="ghost"
      >
        Approve pending tags
      </MenuButton>
      <MenuButton
        icon="XLarge"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onRejectTags}
        type="ghost-danger"
      >
        Reject pending tags
      </MenuButton>
      <MenuButton
        icon="Trash"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onClearTags}
        type="ghost-danger"
      >
        Clear all tags
      </MenuButton>
    </DropdownMenu>
  );
};

export const getColumns = (
  onFileEdit: (file: FileInfo) => void,
  onFileView: (file: FileInfo) => void,
  onApproveTags: (file: FileInfo) => void,
  onRejectTags: (file: FileInfo) => void,
  onClearFileTags: (file: FileInfo) => void
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
          <Flex align justify>
            <InteractiveIcon />
          </Flex>
        </Popover>
        <Button
          unstyled
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
          <Dropdown
            content={
              <FileContextMenu
                onEditFile={(event) => {
                  event.stopPropagation();
                  onFileEdit(file);
                }}
                onApproveFile={() => onApproveTags(file)}
                onClearTags={() => onClearFileTags(file)}
                onRejectTags={() => onRejectTags(file)}
              />
            }
          />
        </ActionsButtons>
      );
    },
  },
];

import React from 'react';
import styled from 'styled-components';
import { Graphic, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import { PERMISSIONS_STRINGS, TOOLTIP_STRINGS } from 'stringConstants';
import { CountTag, Flex, IconButton, Popover } from 'components/Common';
import { FileSmallPreview } from 'components/FileSmallPreview';
import { FileWithAnnotations } from 'hooks/useFileWithAnnotations';
import ReviewStatus from 'components/ReviewStatus';

const SettingButtons = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;

const renderDetectedTags = (file: FileWithAnnotations) => {
  const assetTagsCount =
    (file.annotations ?? []).filter((an) => an.resourceType === 'asset')
      ?.length ?? 0;
  const fileTagsCount =
    (file.annotations ?? []).filter((an) => an.resourceType === 'file')
      ?.length ?? 0;
  return (
    <Flex>
      <CountTag type="assets" value={assetTagsCount} draft={false} />
      <CountTag type="files" value={fileTagsCount} draft={false} />
    </Flex>
  );
};

export const getColumns = (
  onFileEdit: (file: FileInfo) => void,
  onFileView: (file: FileInfo) => void,
  onClearAnnotations: (file: FileInfo) => void,
  writeAccess: boolean
) => [
  {
    title: 'Preview',
    key: 'preview',
    width: 80,
    align: 'center' as 'center',
    render: (file: FileInfo) => (
      <Flex row align justify>
        <Popover
          content={<FileSmallPreview fileId={file.id} />}
          onVisibleChange={(visible) =>
            visible && trackUsage(PNID_METRICS.landingPage.previewFile)
          }
        >
          <Graphic type="Image" />
        </Popover>
      </Flex>
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <div>{name}</div>,
    sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
  },
  {
    title: 'Status',
    key: 'status',
    width: 150,
    render: (_: any, file: FileInfo) => <ReviewStatus file={file} />,
  },
  {
    title: 'Detected tags',
    key: 'tags',
    render: (row: FileWithAnnotations) => renderDetectedTags(row),
    sorter: (a: FileWithAnnotations, b: FileWithAnnotations) =>
      a?.annotations?.length ?? 0 - b?.annotations?.length ?? 0,
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
          <Tooltip content={TOOLTIP_STRINGS.EDIT_FILE_TOOLTIP}>
            <IconButton
              $square
              icon="Edit"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation();
                onFileEdit(file);
              }}
            />
          </Tooltip>
          <Tooltip content={TOOLTIP_STRINGS.VIEW_FILE_TOOLTIP}>
            <IconButton
              $square
              icon="Eye"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation();
                onFileView(file);
              }}
            />
          </Tooltip>
          <Tooltip
            content={
              writeAccess
                ? TOOLTIP_STRINGS.CLEAR_TAGS_TOOLTIP
                : PERMISSIONS_STRINGS.FILES_WRITE_PERMISSIONS
            }
          >
            <IconButton
              $square
              icon="Trash"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation();
                onClearAnnotations(file);
              }}
              disabled={!writeAccess}
            />
          </Tooltip>
        </SettingButtons>
      );
    },
  },
];

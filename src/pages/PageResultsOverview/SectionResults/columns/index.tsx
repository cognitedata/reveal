import React from 'react';
import { Body } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { ApiStatusCount } from 'modules/contextualization/pnidParsing';
import { UploadJobState } from 'modules/contextualization/uploadJobs';
import { stringCompare } from 'modules/contextualization/utils';
import { Flex } from 'components/Common';
import ReviewStatus from 'components/ReviewStatus';
import InteractiveIcon from 'components/InteractiveIcon';
import ColumnProgress from './ColumnProgress';
import ColumnFileActions from './ColumnFileActions';
import ColumnLinkedTo from './ColumnLinkedTo';

export interface AdjustedFileInfo extends FileInfo {
  uploadJob?: UploadJobState;
  status?: keyof ApiStatusCount | 'idle';
  links?: number;
  approval?: boolean;
  svg?: boolean;
}
export const getColumns: any = (workflowId: number) => {
  return [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        stringCompare(a?.name, b?.name),
      render: (name: any) => (
        <Flex row align>
          <InteractiveIcon />
          <Body strong level={2}>
            {name}
          </Body>
        </Flex>
      ),
    },
    {
      title: 'Progress',
      key: 'status',
      width: 150,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        stringCompare(a?.status, b?.status),
      render: (_: any, file: any) => (
        <ColumnProgress file={file} workflowId={workflowId} />
      ),
    },
    {
      title: 'Status',
      width: 150,
      render: (_: any, file: FileInfo) => <ReviewStatus file={file} />,
    },
    {
      title: 'Linked to',
      key: 'annotations_new',
      width: 150,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        (a?.links ?? 0) - (b?.links ?? 0),
      render: (_: any, file: any) => (
        <ColumnLinkedTo fileId={file.id} workflowId={workflowId} />
      ),
    },
    {
      title: 'SVG',
      key: 'svg',
      width: 120,
      sorter: (a: AdjustedFileInfo, b: AdjustedFileInfo) =>
        stringCompare(String(a?.svg), String(b?.svg)),
      render: () => <span>N/A</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (file: any) => <ColumnFileActions file={file} />,
    },
  ];
};

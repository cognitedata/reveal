import { Body, Flex, Tag, Tooltip } from '@cognite/cogs.js';
import { DataSet, CogniteEvent } from '@cognite/sdk';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import capitalize from 'lodash/capitalize';
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import { Column } from 'react-table';
import styled from 'styled-components';

import { HighlightCell, TimeDisplay } from 'components';
import {
  SequenceWithRelationshipLabels,
  TimeseriesWithRelationshipLabels,
} from 'containers';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetNewTable';
import { FileWithRelationshipLabels } from 'containers/Files/FileTable/FileNewTable';
import { mapFileType } from 'utils';

export interface ResourceTableHashMap {
  [key: string]: Column<
    TimeseriesWithRelationshipLabels &
      AssetWithRelationshipLabels &
      CogniteEvent &
      FileWithRelationshipLabels &
      SequenceWithRelationshipLabels
  >;
}

export const ResourceTableColumns: ResourceTableHashMap = {
  name: {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ value }) => <HighlightCell text={value || '-'} />,
  },
  description: {
    Header: 'Description',
    accessor: 'description',
    Cell: ({ value }) => <HighlightCell text={value || '-'} />,
  },
  externalId: {
    Header: 'External ID',
    accessor: 'externalId',
    Cell: ({ value }) => <HighlightCell text={value || '-'} />,
  },
  created: {
    Header: 'Created',
    accessor: 'createdTime',
    Cell: ({ value }) => (
      <Body level={2}>
        <TimeDisplay value={value} />
      </Body>
    ),
  },
  relation: {
    Header: 'Relationship Description(Source/Target)',
    accessor: 'relation',
  },
  labels: {
    Header: 'Labels',
    accessor: 'labels',
    Cell: ({ value }) => (
      <Flex gap={2} wrap="wrap">
        {value?.map(label => (
          <Tooltip content={label.externalId} key={uniqueId()}>
            <StyledTag style={{ display: 'block' }}>
              {label.externalId}
            </StyledTag>
          </Tooltip>
        ))}
      </Flex>
    ),
    width: 200,
  },
  lastUpdatedTime: {
    accessor: 'lastUpdatedTime',
    Header: 'Last updated',
    Cell: ({ value }) => (
      <Body level={2}>
        <TimeDisplay value={value} relative withTooltip />
      </Body>
    ),
  },
  parentExternalId: {
    Header: 'Parent External ID',
    accessor: 'parentExternalId',
  },
  unit: {
    Header: 'Unit',
    accessor: 'unit',
  },

  id: {
    Header: 'ID',
    accessor: 'id',
  },
  isString: {
    Header: 'Is String',
    accessor: 'isString',
    Cell: ({ value }) => <Body level={3}>{capitalize(value.toString())}</Body>,
  },
  isStep: {
    Header: 'Is Step',
    accessor: 'isStep',
    Cell: ({ value }) => <Body level={3}>{capitalize(value.toString())}</Body>,
  },
  dataSet: {
    Header: 'Dataset',
    accessor: 'dataSetId',
    Cell: ({ value }) => {
      const { data: ds } = useCdfItem<DataSet>(
        'datasets',
        { id: value! },
        {
          enabled: Number.isFinite(value),
        }
      );
      return <Body level={3}>{(ds && ds?.name) || '-'}</Body>;
    },
  },
  assets: {
    Header: 'Asset(s)',
    accessor: 'assetId',
    Cell: ({ value, row }) => {
      const data = row.original;
      const ids = value
        ? [{ id: value }]
        : data.assetIds?.map(val => ({ id: val }));
      const { data: items, isFetched } = useCdfItems<{ name?: string }>(
        'assets',
        ids || [],
        true,
        { enabled: Boolean(data.assetIds) || Boolean(data.assetId) }
      );
      const assetsName = items?.map(item => item.name).join(', ');
      return assetsName && isFetched ? (
        <Body level={3}>{assetsName}</Body>
      ) : null;
    },
  },
  type: {
    accessor: 'type',
    Header: 'Type',
    Cell: ({ value, row }) => {
      const finalString = row.original.subtype
        ? `${value} - ${row.original.subtype}`
        : row.original.type;
      return <Body level={3}>{finalString}</Body>;
    },
  },
  startTime: {
    accessor: 'startTime',
    Header: 'Start Time',
    Cell: ({ value }) => (
      <Body level={2}>{value ? <TimeDisplay value={value} /> : '-'}</Body>
    ),
  },
  endTime: {
    accessor: 'endTime',
    Header: 'End Time',
    Cell: ({ value }) => (
      <Body level={2}>{value ? <TimeDisplay value={value} /> : '-'}</Body>
    ),
  },
  mimeType: {
    accessor: 'mimeType',
    Header: 'Type',
    Cell: ({ value }) => (
      <Body level={2}>
        <Tooltip interactive content={value}>
          <>{mapFileType(value || '')}</>
        </Tooltip>
      </Body>
    ),
  },
  uploadedTime: {
    accessor: 'uploadedTime',
    Header: 'Uploaded',
    Cell: ({ row: { original: file } }) => (
      <Body level={2}>
        {file && file.uploaded ? (
          <TimeDisplay value={file.uploadedTime} relative withTooltip />
        ) : (
          '-'
        )}
      </Body>
    ),
  },
  source: {
    accessor: 'source',
    Header: 'Source',
  },
  columns: {
    accessor: 'columns',
    Header: '# of Columns',
    Cell: ({ value }) => <Body level={2}>{value ? value.length : 0}</Body>,
  },
};

const StyledTag = styled(Tag)`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

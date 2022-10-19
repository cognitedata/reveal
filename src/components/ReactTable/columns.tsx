import {
  Body,
  Button,
  Dropdown,
  Flex,
  Menu,
  Tag,
  Tooltip,
} from '@cognite/cogs.js';
import { DataSet, Asset } from '@cognite/sdk';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import capitalize from 'lodash/capitalize';
import uniqueId from 'lodash/uniqueId';
import React from 'react';

import styled, { css } from 'styled-components';

import { HighlightCell, TimeDisplay } from 'components';

import { mapFileType } from 'utils';
import { createLink } from '@cognite/cdf-utilities';
import { useGetRootAsset } from 'hooks';
import { ResourceTableHashMap } from './types';

export const ResourceTableColumns: ResourceTableHashMap = {
  name: {
    Header: 'Name',
    accessor: 'name',
    Cell: ({ value }) => <HighlightCell text={value || '–'} lines={1} />,
  },
  description: {
    Header: 'Description',
    accessor: 'description',
    Cell: ({ value }) => <HighlightCell text={value} lines={1} />,
  },
  externalId: {
    Header: 'External ID',
    accessor: 'externalId',
    Cell: ({ value }) => <HighlightCell text={value} lines={1} />,
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
    Cell: ({ value }) => <Body level={2}>{capitalize(value.toString())}</Body>,
  },
  isStep: {
    Header: 'Is Step',
    accessor: 'isStep',
    Cell: ({ value }) => <Body level={2}>{capitalize(value.toString())}</Body>,
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
      return <Body level={2}>{(ds && ds?.name) || '–'}</Body>;
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
      const { data: items, isFetched } = useCdfItems<Asset>(
        'assets',
        ids || [],
        true,
        { enabled: Boolean(data.assetIds) || Boolean(data.assetId) }
      );

      const hasData = items && items?.length > 0 && isFetched;

      if (!hasData) {
        return null;
      }

      return (
        <Dropdown
          openOnHover
          content={
            <Menu>
              {items?.map(item => (
                <Menu.Item key={item.id}>{item.name}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button icon="ChevronDown" iconPlacement="right">
            {items?.length} Asset(s)
          </Button>
        </Dropdown>
      );
    },
  },
  type: {
    accessor: 'type',
    Header: 'Type',
    Cell: ({ value, row }) => {
      const finalString = row.original.subtype
        ? `${value} - ${row.original.subtype}`
        : row.original.type;
      return <HighlightCell lines={1} text={finalString} />;
    },
  },
  startTime: {
    accessor: 'startTime',
    Header: 'Start Time',
    Cell: ({ value }) => (
      <Body level={2}>{value ? <TimeDisplay value={value} /> : '–'}</Body>
    ),
  },
  endTime: {
    accessor: 'endTime',
    Header: 'End Time',
    Cell: ({ value }) => (
      <Body level={2}>{value ? <TimeDisplay value={value} /> : '–'}</Body>
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
          '–'
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
    Header: '№ of Columns',
    Cell: ({ value }) => <Body level={2}>{value ? value.length : 0}</Body>,
  },
  asset: {
    accessor: 'assetId',
    Header: 'Root Asset',
    Cell: ({ value }) => {
      const { data: rootAsset, isLoading } = useGetRootAsset(value!);

      return isLoading || rootAsset?.name ? (
        <Button
          type="link"
          target="_blank"
          href={createLink(`/explore/asset/${value}`)}
          icon="ArrowUpRight"
          iconPlacement="right"
        >
          <StyledButton>{rootAsset?.name}</StyledButton>
        </Button>
      ) : null;
    },
  },
  rootAsset: {
    accessor: 'rootId',
    Header: 'Root Asset',
    Cell: ({ value }) => {
      const { data: rootAsset, isLoading } = useGetRootAsset(value!);

      return isLoading || rootAsset?.name ? (
        <Button
          type="link"
          target="_blank"
          href={createLink(`/explore/asset/${value}`)}
          icon="ArrowUpRight"
          iconPlacement="right"
        >
          <StyledButton>{rootAsset?.name}</StyledButton>
        </Button>
      ) : null;
    },
  },
  relationshipLabels: {
    accessor: 'relationshipLabels',
    Header: 'Relationship Labels',
    width: 250,
    Cell: ({ value }) => (
      <Flex gap={2} wrap="wrap">
        {value?.map((label: string) => (
          <Tooltip content={label} key={uniqueId()}>
            <StyledTag style={{ display: 'block' }}>{label}</StyledTag>
          </Tooltip>
        ))}
      </Flex>
    ),
  },
};

const ellipsistyles = css`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTag = styled(Tag)`
  ${ellipsistyles};
`;

export const StyledButton = styled.div`
  ${ellipsistyles};
  max-width: 80px;
`;

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

import { DASH, mapFileType } from 'utils';
import { createLink } from '@cognite/cdf-utilities';
import { useGetRootAsset } from 'hooks';
import { ResourceTableHashMap2 } from '../types';

// TODO: this whole approach needs to be refactored a bit, especially the usage of hooks and stuff
export const ResourceTableColumns: ResourceTableHashMap2 = {
  name: {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  description: {
    header: 'Description',
    accessorKey: 'description',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  externalId: {
    header: 'External ID',
    accessorKey: 'externalId',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  created: {
    header: 'Created',
    accessorKey: 'createdTime',
    cell: ({ getValue }) => (
      <Body level={2}>
        <TimeDisplay value={getValue<number | Date>()} />
      </Body>
    ),
  },
  relation: {
    header: 'Relationship Description(Source/Target)',
    accessorKey: 'relation',
  },
  labels: {
    header: 'Labels',
    accessorKey: 'labels',
    cell: ({ getValue }) => (
      <Flex gap={2} wrap="wrap">
        {getValue<{ externalId: string }[]>()?.map(label => (
          <Tooltip content={label.externalId} key={uniqueId()}>
            <StyledTag style={{ display: 'block' }}>
              {label.externalId}
            </StyledTag>
          </Tooltip>
        ))}
      </Flex>
    ),
    size: 200,
  },
  lastUpdatedTime: {
    accessorKey: 'lastUpdatedTime',
    header: 'Last updated',
    cell: ({ getValue }) => (
      <Body level={2}>
        <TimeDisplay value={getValue<number | Date>()} relative withTooltip />
      </Body>
    ),
  },
  parentExternalId: {
    header: 'Parent External ID',
    accessorKey: 'parentExternalId',
  },
  unit: {
    header: 'Unit',
    accessorKey: 'unit',
  },

  id: {
    header: 'ID',
    accessorKey: 'id',
  },
  isString: {
    header: 'Is String',
    accessorKey: 'isString',
    cell: ({ getValue }) => (
      <Body level={2}>{capitalize(getValue<boolean>().toString())}</Body>
    ),
  },
  isStep: {
    header: 'Is Step',
    accessorKey: 'isStep',
    cell: ({ getValue }) => (
      <Body level={2}>{capitalize(getValue<boolean>().toString())}</Body>
    ),
  },
  dataSet: {
    header: 'Dataset',
    accessorKey: 'dataSetId',
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: ds } = useCdfItem<DataSet>(
        'datasets',
        { id: getValue<number>()! },
        {
          enabled: Number.isFinite(getValue()),
        }
      );
      return <Body level={2}>{(ds && ds?.name) || DASH}</Body>;
    },
  },
  assets: {
    header: 'Asset(s)',
    accessorKey: 'assetId',
    cell: ({ getValue, row }) => {
      const data = row.original;
      const ids = getValue()
        ? [{ id: getValue<number>() }]
        : data.assetIds?.map(val => ({ id: val }));

      // eslint-disable-next-line react-hooks/rules-of-hooks
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

      if (items.length === 1) {
        const rootAsset = items[0];
        return (
          <Button
            onClick={e => e.stopPropagation()}
            type="link"
            target="_blank"
            href={createLink(`/explore/asset/${rootAsset.id}`)}
            icon="ArrowUpRight"
            iconPlacement="right"
          >
            <StyledButton>{rootAsset.name}</StyledButton>
          </Button>
        );
      }

      return (
        <Dropdown
          openOnHover
          content={
            <Menu>
              {items?.map(item => (
                <Menu.Item
                  onClick={e => e.stopPropagation()}
                  href={createLink(`/explore/asset/${item.id}`)}
                  target="_blank"
                  key={item.id}
                >
                  {item.name}
                </Menu.Item>
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
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue, row }) => {
      const finalString = row.original.subtype
        ? `${getValue()} - ${row.original.subtype}`
        : row.original.type;
      return <HighlightCell lines={1} text={finalString} />;
    },
  },
  startTime: {
    accessorKey: 'startTime',
    header: 'Start Time',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? <TimeDisplay value={getValue<number | Date>()} /> : DASH}
      </Body>
    ),
  },
  endTime: {
    accessorKey: 'endTime',
    header: 'End Time',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? <TimeDisplay value={getValue<number | Date>()} /> : DASH}
      </Body>
    ),
  },
  mimeType: {
    accessorKey: 'mimeType',
    header: 'Type',
    cell: ({ getValue }) => (
      <Body level={2}>
        <Tooltip interactive content={getValue<string>()}>
          <>{mapFileType(getValue<string>() || '')}</>
        </Tooltip>
      </Body>
    ),
  },
  uploadedTime: {
    accessorKey: 'uploadedTime',
    header: 'Uploaded',
    cell: ({ row: { original: file } }) => (
      <Body level={2}>
        {file && file.uploaded ? (
          <TimeDisplay value={file.uploadedTime} relative withTooltip />
        ) : (
          DASH
        )}
      </Body>
    ),
  },
  source: {
    accessorKey: 'source',
    header: 'Source',
  },
  columns: {
    accessorKey: 'columns',
    header: '№ of Columns',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? getValue<Array<unknown>>().length : 0}
      </Body>
    ),
  },
  asset: {
    accessorKey: 'assetId',
    header: 'Root Asset',
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: rootAsset, isLoading } = useGetRootAsset(
        getValue<number>()!
      );

      return isLoading || rootAsset?.name ? (
        <Button
          type="link"
          onClick={e => e.stopPropagation()}
          target="_blank"
          href={createLink(`/explore/asset/${getValue()}`)}
          icon="ArrowUpRight"
          iconPlacement="right"
        >
          <StyledButton>{rootAsset?.name}</StyledButton>
        </Button>
      ) : null;
    },
  },
  rootAsset: {
    accessorKey: 'rootId',
    header: 'Root Asset',
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: rootAsset, isLoading } = useGetRootAsset(
        getValue<number>()!
      );

      return isLoading || rootAsset?.name ? (
        <Button
          onClick={e => e.stopPropagation()}
          type="link"
          target="_blank"
          href={createLink(`/explore/asset/${getValue()}`)}
          icon="ArrowUpRight"
          iconPlacement="right"
        >
          <StyledButton>{rootAsset?.name}</StyledButton>
        </Button>
      ) : null;
    },
  },
  relationshipLabels: {
    accessorKey: 'relationshipLabels',
    header: 'Relationship Labels',
    size: 250,
    cell: ({ getValue }) => (
      <Flex gap={2} wrap="wrap">
        {getValue<string[]>()?.map((label: string) => (
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

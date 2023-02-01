import { Body, Button, Flex, Tooltip } from '@cognite/cogs.js';
import { DataSet, Asset } from '@cognite/sdk';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import capitalize from 'lodash/capitalize';
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import { StyledLabel, StyledButton } from './elements';

import {
  HighlightCell,
  TimeDisplay,
} from '@data-exploration-components/components';

import {
  DASH,
  getMetadataValueByKey,
  isNumber,
  mapFileType,
  METADATA_KEY_SEPARATOR,
} from '@data-exploration-components/utils';
import { createLink } from '@cognite/cdf-utilities';
import { useGetRootAsset } from '@data-exploration-components/hooks';
import { RootAssetCell } from './RootAssetCell';
import { ResourceTableHashMap } from './types';
import { DirectAssets } from './DirectAssets';

// TODO: this whole approach needs to be refactored a bit, especially the usage of hooks and stuff
export const ResourceTableColumns: ResourceTableHashMap = {
  name: (query?: string) => {
    return {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  description: (query?: string) => {
    return {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  // [Product Decision]: We are highlighting type and external id fields according to the query
  // even though search has nothing to do with these fields.
  // https://docs.google.com/document/d/1NealpKxykyosTPul9695oX_njJjwyIlEhqYoDAsCLIg
  externalId: (query?: string) => {
    return {
      header: 'External ID',
      accessorKey: 'externalId',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  type: (query?: string) => {
    return {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  id: (query?: string) => {
    return {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ getValue }) => {
        const text = isNumber(getValue<number>())
          ? `${getValue<number>()}`
          : DASH;
        return <HighlightCell query={query} text={text} lines={1} />;
      },
    };
  },
  subtype: (query?: string) => {
    return {
      accessorKey: 'subtype',
      header: 'Subtype',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            lines={1}
            text={getValue<string>() || DASH}
            query={query}
          />
        );
      },
    };
  },
  source: (query?: string) => {
    return {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ getValue }) => (
        <HighlightCell
          text={getValue<string>() || DASH}
          lines={1}
          query={query}
        />
      ),
    };
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
    header: 'Relationship description(Source/Target)',
    accessorKey: 'relation',
  },
  labels: {
    header: 'Labels',
    accessorKey: 'labels',
    cell: ({ getValue }) => (
      <Flex gap={2} wrap="wrap">
        {getValue<{ externalId: string }[]>()?.map((label) => (
          <Tooltip content={label.externalId} key={uniqueId()}>
            <StyledLabel variant="unknown" size="small">
              {label.externalId}
            </StyledLabel>
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
    header: 'Parent external ID',
    accessorKey: 'parentExternalId',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  unit: (query?: string) => {
    return {
      header: 'Unit',
      accessorKey: 'unit',
      cell: ({ getValue }) => (
        <HighlightCell
          text={getValue<string>() || DASH}
          lines={1}
          query={query}
        />
      ),
    };
  },
  isString: {
    header: 'Is string',
    accessorKey: 'isString',
    cell: ({ getValue }) => (
      <Body level={2}>{capitalize(getValue<boolean>().toString())}</Body>
    ),
  },
  isStep: {
    header: 'Is step',
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
    header: 'Direct Asset(s)',
    accessorFn: (resourceData) => resourceData.assetId,
    id: 'directAsset',
    enableSorting: false,
    cell: ({ getValue, row }) => {
      const data = row.original;
      const assetIdValue = getValue<number>();
      const ids = assetIdValue
        ? [{ id: assetIdValue }]
        : data.assetIds?.map((val) => ({ id: val }));

      return <DirectAssets ids={ids} data={data} />;
    },
  },
  startTime: {
    accessorKey: 'startTime',
    header: 'Start time',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? <TimeDisplay value={getValue<number | Date>()} /> : DASH}
      </Body>
    ),
  },
  endTime: {
    accessorKey: 'endTime',
    header: 'End time',
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
  columns: {
    accessorKey: 'columns',
    header: '№ of Columns',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? getValue<Array<unknown>>().length : 0}
      </Body>
    ),
  },
  rootAsset: {
    accessorFn: (resourceData) => resourceData.assetId || resourceData.rootId,
    header: 'Root asset',
    id: 'rootAsset',
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>();
      if (!value) return <>{DASH}</>;
      return <RootAssetCell value={value} />;
    },
    enableSorting: false,
  },
  relationshipLabels: {
    accessorKey: 'relationshipLabels',
    header: 'Relationship labels',
    size: 250,
    cell: ({ getValue }) => (
      <Flex gap={2} wrap="wrap">
        {getValue<string[]>()?.map((label: string) => (
          <Tooltip content={label} key={uniqueId()}>
            <StyledLabel variant="unknown" size="small">
              {label}
            </StyledLabel>
          </Tooltip>
        ))}
      </Flex>
    ),
  },
  metadata: (key: string, accessorFn?: (row: any) => string) => {
    return {
      id: `metadata${METADATA_KEY_SEPARATOR}${key}`,
      accessorFn: (row) =>
        accessorFn
          ? accessorFn(row)
          : getMetadataValueByKey(key, row?.metadata),
      header: key,
      meta: {
        isMetadata: true,
      },
    };
  },
};

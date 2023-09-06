import React from 'react';

import capitalize from 'lodash/capitalize';
import uniqueId from 'lodash/uniqueId';

import { Body, Flex, Tooltip } from '@cognite/cogs.js';
import { DataSet, Asset } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import {
  DASH,
  METADATA_KEY_SEPARATOR,
  getMetadataValueByKey,
  isNumber,
  mapFileType,
  TFunction,
} from '@data-exploration-lib/core';
import { useGetLabelName } from '@data-exploration-lib/domain-layer';

import { ThreeDModelCell } from '../Details/ThreeDModelCell';
import { RootAsset } from '../RootAsset';
import { TimeDisplay } from '../TimeDisplay';

import { DirectAssets, HighlightCell } from './components';
import { StyledLabel } from './elements';
import { ResourceTableHashMap } from './types';

// TODO: this whole approach needs to be refactored a bit, especially the usage of hooks and stuff
export const getTableColumns = (t: TFunction): ResourceTableHashMap => ({
  name: (query?: string) => {
    return {
      header: t('NAME', 'Name'),
      accessorKey: 'name',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
            highlightPrefix={false}
          />
        );
      },
    };
  },
  description: (query?: string) => {
    return {
      header: t('DESCRIPTION', 'Description'),
      accessorKey: 'description',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
            highlightPrefix={false}
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
      header: t('EXTERNAL_ID', 'External ID'),
      accessorKey: 'externalId',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
            highlightPrefix={true}
          />
        );
      },
    };
  },
  type: (query?: string) => {
    return {
      header: t('TYPE', 'Type'),
      accessorKey: 'type',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
            highlightPrefix={true}
          />
        );
      },
    };
  },
  rootAsset: (onClick) => {
    return {
      accessorFn: (resourceData) => resourceData.assetId || resourceData.rootId,
      header: t('ROOT_ASSET', 'Root asset'),
      id: 'rootAsset',
      enableSorting: false,
      cell: ({ row, getValue }) => {
        const value = getValue<number | undefined>();
        const handleOnRootAssetClick = (rootAsset: Asset) => {
          if (onClick) {
            onClick(rootAsset, row.original.id);
          }
        };

        return <RootAsset onClick={handleOnRootAssetClick} assetId={value} />;
      },
    };
  },
  assets: (onClick) => {
    return {
      accessorFn: (resourceData) => resourceData.assetId,
      header: t('DIRECT_ASSET', 'Direct asset'),
      id: 'directAsset',
      enableSorting: false,
      cell: ({ getValue, row }) => {
        const data = row.original;
        const assetIdValue = getValue<number>();
        const ids = assetIdValue
          ? [{ id: assetIdValue }]
          : data.assetIds?.map((val) => ({ id: val }));

        const handleOnDirectAssetClick = (directAsset: Asset) => {
          if (onClick) {
            onClick(directAsset, data.id);
          }
        };

        return (
          <DirectAssets
            ids={ids}
            data={data}
            onClick={handleOnDirectAssetClick}
          />
        );
      },
    };
  },
  id: (query?: string) => {
    return {
      header: t('ID', 'ID'),
      accessorKey: 'id',
      cell: ({ getValue }) => {
        const text = isNumber(getValue<number>())
          ? `${getValue<number>()}`
          : DASH;
        return (
          <HighlightCell
            query={query}
            text={text}
            lines={1}
            highlightPrefix={true}
          />
        );
      },
    };
  },
  subtype: (query?: string) => {
    return {
      accessorKey: 'subtype',
      header: t('SUBTYPE', 'Subtype'),
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            lines={1}
            text={getValue<string>() || DASH}
            query={query}
            highlightPrefix={true}
          />
        );
      },
    };
  },
  source: (query?: string) => {
    return {
      accessorKey: 'source',
      header: t('SOURCE', 'Source'),
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            text={getValue<string>() || DASH}
            lines={1}
            query={query}
            highlightPrefix={true}
          />
        );
      },
    };
  },
  availabilityThreeD: {
    id: 'threeDModels',
    accessorKey: 'id',
    header: t('3D_AVAILABILITY', '3D availability'),
    cell: ({ getValue }) => <ThreeDModelCell assetId={getValue<number>()} />,
    size: 300,
    enableSorting: false,
  },
  created: {
    header: t('CREATED_TIME', 'Created'),
    accessorKey: 'createdTime',
    cell: ({ getValue }) => (
      <Body level={2}>
        <TimeDisplay value={getValue<number | Date>()} />
      </Body>
    ),
  },
  relation: {
    header: t(
      'RELATIONSHIP_DESCRIPTION',
      'Relationship description(Source/Target)'
    ),
    accessorKey: 'relation',
  },
  labels: {
    header: t('LABELS', 'Labels'),
    accessorKey: 'labels',
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const getLabelName = useGetLabelName();

      return (
        <Flex gap={2} wrap="wrap">
          {getValue<{ externalId: string }[]>()?.map((label) => {
            const labelName = getLabelName(label.externalId);

            return (
              <Tooltip content={labelName} key={uniqueId()}>
                <StyledLabel size="small" label={labelName} />
              </Tooltip>
            );
          })}
        </Flex>
      );
    },
    size: 200,
  },
  lastUpdatedTime: {
    accessorKey: 'lastUpdatedTime',
    header: t('LAST_UPDATED', 'Last updated'),
    cell: ({ getValue }) => (
      <Body level={2}>
        <TimeDisplay value={getValue<number | Date>()} relative withTooltip />
      </Body>
    ),
  },
  parentExternalId: {
    header: t('PARENT_EXTERNAL_ID', 'Parent external ID'),
    accessorKey: 'parentExternalId',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  unit: (query?: string) => {
    return {
      header: t('UNIT', 'Unit'),
      accessorKey: 'unit',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            text={getValue<string>() || DASH}
            lines={1}
            query={query}
            highlightPrefix={true}
          />
        );
      },
    };
  },
  isString: {
    header: t('IS_STRING', 'Is string'),
    accessorKey: 'isString',
    cell: ({ getValue }) => (
      <Body level={2}>{capitalize(getValue<boolean>().toString())}</Body>
    ),
  },
  isStep: {
    header: t('IS_STEP', 'Is step'),
    accessorKey: 'isStep',
    cell: ({ getValue }) => (
      <Body level={2}>{capitalize(getValue<boolean>().toString())}</Body>
    ),
  },
  dataSet: {
    header: t('DATA_SET', 'Data set'),
    id: 'dataSetId',
    enableSorting: false,
    accessorFn: (resource) => resource.dataSetId,
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
  startTime: {
    accessorKey: 'startTime',
    header: t('START_TIME', 'Start time'),
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? <TimeDisplay value={getValue<number | Date>()} /> : DASH}
      </Body>
    ),
  },
  endTime: {
    accessorKey: 'endTime',
    header: t('END_TIME', 'End time'),
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? <TimeDisplay value={getValue<number | Date>()} /> : DASH}
      </Body>
    ),
  },
  mimeType: {
    accessorKey: 'mimeType',
    header: t('TYPE', 'Type'),
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
    header: t('UPLOADED', 'Uploaded'),
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
    header: t('NUMBER_OF_COLUMNS', '№ of Columns'),
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? getValue<Array<unknown>>().length : 0}
      </Body>
    ),
  },

  relationshipLabels: {
    accessorKey: 'relationshipLabels',
    header: t('RELATIONSHIP_LABELS', 'Relationship labels'),
    size: 250,
    cell: ({ getValue }) => {
      const labels = getValue<string[]>() || [];

      if (labels.length === 0) {
        return <Flex>{DASH}</Flex>;
      }

      return (
        <Flex gap={2} wrap="wrap">
          {getValue<string[]>()?.map((label: string) => (
            <Tooltip content={label} key={uniqueId()}>
              <StyledLabel size="x-small" label={label} />
            </Tooltip>
          ))}
        </Flex>
      );
    },
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
});

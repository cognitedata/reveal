import { ConflictMode, ResourceType } from '@transformations/types';

import { IconType } from '@cognite/cogs.js';

import { getActionTypeDisplayName } from './utils';

export const DESTINATION_TYPE_OPTIONS: {
  title: string;
  items: {
    icon: IconType;
    value: ResourceType;
  }[];
}[] = [
  {
    title: 'Store data',
    items: [
      {
        icon: 'Assets',
        value: 'assets',
      },
      {
        icon: 'Tree',
        value: 'asset_hierarchy',
      },
      {
        icon: 'Timeseries',
        value: 'timeseries',
      },
      {
        icon: 'Number',
        value: 'datapoints',
      },
      {
        icon: 'String',
        value: 'string_datapoints',
      },
      {
        icon: 'Events',
        value: 'events',
      },
      {
        icon: 'Document',
        value: 'files',
      },
      {
        icon: 'Sequences',
        value: 'sequences',
      },
      {
        icon: 'Sequences',
        value: 'sequence_rows',
      },
      {
        icon: 'OilPlatform',
        value: 'well_data_layer',
      },
    ],
  },
  {
    title: 'Organize data',
    items: [
      {
        icon: 'DataSource',
        value: 'data_sets',
      },
      {
        icon: 'Tag',
        value: 'labels',
      },
      {
        icon: 'Link',
        value: 'relationships',
      },
    ],
  },
];

export const DESTINATION_ACTION_OPTIONS: {
  label: string;
  value: ConflictMode;
}[] = [
  {
    label: getActionTypeDisplayName('abort'),
    value: 'abort',
  },
  {
    label: getActionTypeDisplayName('delete'),
    value: 'delete',
  },
  {
    label: getActionTypeDisplayName('update'),
    value: 'update',
  },
  {
    label: getActionTypeDisplayName('upsert'),
    value: 'upsert',
  },
];

import { SearchConfigDataType } from '../types';

export const getMockSearchConfig = (): SearchConfigDataType => ({
  asset: {
    name: {
      label: 'Name',
      enabled: true,
    },
    description: {
      label: 'Description',
      enabled: true,
    },
    externalId: {
      label: 'External Id',
      enabled: true,
    },
    id: { label: 'ID', enabled: true },
    metadata: {
      label: 'Metadata',
      enabled: true,
    },
    source: {
      label: 'Source',
      enabled: true,
    },
    labels: {
      label: 'Labels',
      enabled: true,
    },
  },
  timeSeries: {
    name: {
      label: 'Name',
      enabled: true,
    },
    description: {
      label: 'Description',
      enabled: true,
    },
    externalId: { label: 'External Id', enabled: true },
    id: { label: 'ID', enabled: true },
    metadata: { label: 'Metadata', enabled: true },
    unit: { label: 'Unit', enabled: true },
  },
  file: {
    'sourceFile|name': {
      label: 'Name',
      enabled: true,
    },
    content: {
      label: 'Content',
      enabled: true,
    },
    externalId: { label: 'External Id', enabled: true },
    id: { label: 'ID', enabled: true },
    'sourceFile|metadata': {
      label: 'Metadata',
      enabled: true,
    },
    'sourceFile|source': {
      label: 'Source',
      enabled: true,
    },
    labels: { label: 'Label', enabled: true },
  },
  event: {
    type: {
      label: 'Type',
      enabled: true,
    },
    description: {
      label: 'Description',
      enabled: true,
    },
    externalId: { label: 'External Id', enabled: true },
    id: { label: 'ID', enabled: true },
    metadata: { label: 'Metadata', enabled: true },
    source: { label: 'Source', enabled: true },
    subtype: { label: 'Subtype', enabled: true },
  },
  sequence: {
    name: {
      label: 'Name',
      enabled: true,
    },
    description: {
      label: 'Description',
      enabled: true,
    },
    externalId: { label: 'External Id', enabled: true },
    id: { label: 'ID', enabled: true },
    metadata: { label: 'Metadata', enabled: true },
  },
});

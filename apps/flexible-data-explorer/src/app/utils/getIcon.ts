import { IconType } from '@cognite/cogs.js';

/**
 * Resolves a value to a matching (cogs.js) icon type.
 */
export const getIcon = (value: string): IconType => {
  const type = value.toLocaleLowerCase();

  if (['user', 'person', 'director'].includes(type)) {
    return 'User';
  }

  if (['asset'].includes(type)) {
    return 'Assets';
  }

  if (['time series', 'timeseries'].includes(type)) {
    return 'Timeseries';
  }

  if (['document', 'file'].includes(type)) {
    return 'Document';
  }

  if (['pump', 'compressor', 'valve', 'flange', 'tank'].includes(type)) {
    return 'Gauge';
  }

  if (['manufacturer', 'supplier', 'facility', 'vendor'].includes(type)) {
    return 'AzureDataFactory';
  }

  return 'Component';
};

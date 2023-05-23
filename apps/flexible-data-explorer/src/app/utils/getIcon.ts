import { IconType } from '@cognite/cogs.js';

/**
 * Resolves a value to a matching (cogs.js) icon type.
 *
 * NOTE: the value (type) has to be singular to also match on plural tense.
 * For example: value (and not values), user (and not users), etc...
 */
export const getIcon = (value: string): IconType => {
  const type = value.toLocaleLowerCase();

  if (['user', 'person', 'director'].includes(type)) {
    return 'User';
  }

  if (['asset'].includes(type)) {
    return 'Assets';
  }

  if (['timeserie'].includes(type)) {
    return 'Timeseries';
  }

  if (['document', 'file'].includes(type)) {
    return 'Document';
  }

  return 'Component';
};

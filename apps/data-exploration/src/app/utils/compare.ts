import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';

import { ResourceItem, ResourceItemState } from '@cognite/data-exploration';

export const isObjectEmpty = <T extends Record<string, unknown>>(
  object?: T
) => {
  if (isEmpty(object) || object === undefined || !isObject(object)) {
    return true;
  }

  const isAllPropertiesInObjectEmpty = Object.keys(object).every((key) => {
    const value = object[key];

    return (
      value === undefined ||
      value === null ||
      ((isObject(value) || isArray(value)) && isEmpty(value))
    );
  });

  return isAllPropertiesInObjectEmpty;
};

export const isResourceSelected = (
  resource: ResourceItem,
  resourcesState: ResourceItemState[]
): boolean => {
  return resourcesState.some(
    (element) =>
      element.state === 'selected' &&
      element.id === resource.id &&
      element.type === resource.type
  );
};

import { useMemo } from 'react';
import { is360ImageAddOptions } from '../typeGuards';
import {
  type AddResourceOptions,
  type AddCadResourceOptions,
  type AddPointCloudResourceOptions
} from '../types';

export const useCadOrPointCloudResources = (
  resources: AddResourceOptions[]
): Array<AddCadResourceOptions | AddPointCloudResourceOptions> => {
  return useMemo(
    () =>
      resources.filter(
        (resource): resource is AddCadResourceOptions | AddPointCloudResourceOptions =>
          !is360ImageAddOptions(resource)
      ),
    [resources]
  );
};

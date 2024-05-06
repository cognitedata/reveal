/*!
 * Copyright 2024 Cognite AS
 */
import { type AddResourceOptions, type AddReveal3DModelOptions } from './types';
import { isSameModel } from '../../utilities/isSameModel';

export function findNewAndOutdatedResources(
  newResourceOptions: AddResourceOptions[],
  oldResourceOptions: AddResourceOptions[]
): { newResources: AddResourceOptions[]; outdatedResources: AddResourceOptions[] } {
  const remainingNewResourceOptions = new Set(newResourceOptions);
  const remainingOldResourceOptions = new Set(oldResourceOptions);

  newResourceOptions.forEach((newResource) => {
    oldResourceOptions.some((oldResource) => {
      const equal = isSameModel(newResource, oldResource);

      if (equal) {
        remainingNewResourceOptions.delete(newResource);
        remainingOldResourceOptions.delete(oldResource);
      }

      return equal;
    });
  });

  return {
    newResources: Array.from(remainingNewResourceOptions),
    outdatedResources: Array.from(remainingOldResourceOptions)
  };
}

export function is3dModelOptions(
  addOptions: AddResourceOptions
): addOptions is AddReveal3DModelOptions {
  return (
    (addOptions as AddReveal3DModelOptions).modelId !== undefined &&
    (addOptions as AddReveal3DModelOptions).revisionId !== undefined
  );
}

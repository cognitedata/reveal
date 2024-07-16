/*!
 * Copyright 2023 Cognite AS
 */
import { type Add3dResourceOptions, type AddResourceOptions } from '../../src';

export function is3DModelOptions(
  threeDResource: AddResourceOptions
): threeDResource is Add3dResourceOptions {
  return (
    (threeDResource as Add3dResourceOptions).modelId !== undefined &&
    (threeDResource as Add3dResourceOptions).revisionId !== undefined
  );
}

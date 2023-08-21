/*!
 * Copyright 2023 Cognite AS
 */
import { type AddResourceOptions, type AddReveal3DModelOptions } from '../../src';

export function is3DModelOptions(
  threeDResource: AddResourceOptions
): threeDResource is AddReveal3DModelOptions {
  return (
    (threeDResource as AddReveal3DModelOptions).modelId !== undefined &&
    (threeDResource as AddReveal3DModelOptions).revisionId !== undefined
  );
}

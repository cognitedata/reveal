/*!
 * Copyright 2023 Cognite AS
 */

import { type FunctionComponent } from 'react';
import { withCameraStateUrlParam } from './withCameraStateUrlParam';
import { withSlicerStateUrlParam } from './withSlicerStateUrlParam';

export function withCombinedUrlParams<T extends object>(
  component: FunctionComponent<T>
): FunctionComponent<T> {
  const componentWithSlicerState = withSlicerStateUrlParam(component);
  const combinedComponent = withCameraStateUrlParam(componentWithSlicerState);

  return combinedComponent;
}

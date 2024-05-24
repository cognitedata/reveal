/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { MeasureDomainObject } from './MeasureDomainObject';

// ==================================================
// PUBLIC FUNCTIONS
// ==================================================

export function getAnyMeasureDomainObject(
  renderTarget: RevealRenderTarget
): MeasureDomainObject | undefined {
  // eslint-disable-next-line no-unreachable-loop
  for (const domainObject of getMeasureDomainObjects(renderTarget)) {
    return domainObject;
  }
  return undefined;
}

export function* getMeasureDomainObjects(
  renderTarget: RevealRenderTarget
): Generator<MeasureDomainObject> {
  const { rootDomainObject } = renderTarget;
  for (const descendant of rootDomainObject.getDescendantsByType(MeasureDomainObject)) {
    yield descendant;
  }
}

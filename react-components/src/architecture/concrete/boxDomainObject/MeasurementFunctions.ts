/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { MeasureLineDomainObject } from './MeasureLineDomainObject';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';

// ==================================================
// PUBLIC FUNCTIONS
// ==================================================

export function getAnyMeasureDomainObject(
  renderTarget: RevealRenderTarget
): DomainObject | undefined {
  // eslint-disable-next-line no-unreachable-loop
  for (const domainObject of getMeasurementDomainObjects(renderTarget)) {
    return domainObject;
  }
  return undefined;
}

export function* getMeasurementDomainObjects(
  renderTarget: RevealRenderTarget
): Generator<MeasureBoxDomainObject | MeasureLineDomainObject> {
  const { rootDomainObject } = renderTarget;
  for (const descendant of rootDomainObject.getDescendants()) {
    if (descendant instanceof MeasureBoxDomainObject) {
      yield descendant;
    }
    if (descendant instanceof MeasureLineDomainObject) {
      yield descendant;
    }
  }
}

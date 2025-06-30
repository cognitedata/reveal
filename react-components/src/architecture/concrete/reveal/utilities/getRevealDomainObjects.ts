import type { RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { filter, filterTypeGuard } from '../../../base/utilities/extensions/generatorUtils';
import { isRevealDomainObject, type RevealDomainObject } from './typeGuards';

export function getRevealDomainObjects(
  renderTarget: RevealRenderTarget,
  predicate: (domainObject: RevealDomainObject) => boolean = (_) => true
): Generator<RevealDomainObject> {
  return filter(
    filterTypeGuard(renderTarget.rootDomainObject.getDescendants(), isRevealDomainObject),
    predicate
  );
}

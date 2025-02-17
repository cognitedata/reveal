/*!
 * Copyright 2025 Cognite AS
 */

import { type RootDomainObject } from './RootDomainObject';
import { type DomainObject } from './DomainObject';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

/**
 * Retrieves the root domain object if it is an instance of `RootDomainObject`.
 *
 * @param domainObject - The domain object from which to retrieve the root.
 * @returns The root domain object if it is an instance of `RootDomainObject`, otherwise `undefined`.
 */
export function getRoot(domainObject: DomainObject): RootDomainObject | undefined {
  const root = domainObject.root;
  return root as RootDomainObject;
}

/**
 * Retrieves the render target associated with the root of the given domain object.
 *
 * @param domainObject - The domain object for which to retrieve the render target.
 * @returns The render target associated with the root of the domain object, or `undefined` if no render target is found.
 */
export function getRenderTarget(domainObject: DomainObject): RevealRenderTarget | undefined {
  const root = getRoot(domainObject);
  return root?.renderTarget;
}

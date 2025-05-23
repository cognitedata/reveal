/*!
 * Copyright 2024 Cognite AS
 */

import { ExampleDomainObject } from './ExampleDomainObject';
import { type DomainObject } from '../../base/domainObjects/DomainObject';

export function createExampleDomainObject(): ExampleDomainObject {
  const domainObject = new ExampleDomainObject();
  domainObject.center.set(1, 2, 3);
  return domainObject;
}

export function addExampleDomainObjects(root: DomainObject, count: number): void {
  for (let i = 0; i < count; i++) {
    const domainObject = createExampleDomainObject();
    root.addChildInteractive(domainObject);
  }
}

export function getNumberOfExampleDomainObjects(root: DomainObject): number {
  let count = 0;
  for (const _descendant of root.getDescendantsByType(ExampleDomainObject)) {
    count++;
  }
  return count;
}

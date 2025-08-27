import { ExampleDomainObject } from './ExampleDomainObject';
import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { count } from '../../base/utilities/extensions/generatorUtils';

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
  return count(root.getDescendantsByType(ExampleDomainObject));
}

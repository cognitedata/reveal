import { signal } from '@cognite/signals';
import { type DisposableSignal } from '../../../../utilities/signal/DisposableSignal';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { filter } from '../../../base/utilities/extensions/generatorUtils';
import { RevealDomainObject } from '../RevealDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';

export function getRevealDomainUpdateSignal(
  renderTarget: RevealRenderTarget,
  predicate: (domainObject: RevealDomainObject) => boolean = () => true,
  additionalChangeFlags: symbol[] = []
): DisposableSignal<RevealDomainObject[]> {
  const objectsSignal = signal<() => RevealDomainObject[]>(() =>
    getRevealDomainObjects(renderTarget, predicate)
  );

  renderTarget.rootDomainObject.views.addEventListener(updateDomainObjectListOnRelevantEvent);

  return {
    signal: objectsSignal,
    dispose: () => {
      renderTarget.rootDomainObject.views.removeEventListener(
        updateDomainObjectListOnRelevantEvent
      );
    }
  };

  function updateDomainObjectListOnRelevantEvent(
    domainObject: DomainObject,
    change: DomainObjectChange
  ): void {
    const relevantChanges = [Changes.added, Changes.deleting, ...additionalChangeFlags];

    if (!(domainObject instanceof RevealDomainObject)) {
      return;
    }

    const isRelevantChange = change.isChanged(...relevantChanges);

    if (!isRelevantChange) {
      return;
    }

    objectsSignal(() => getRevealDomainObjects(renderTarget, predicate));
  }
}

function getRevealDomainObjects(
  renderTarget: RevealRenderTarget,
  predicate: (domainObject: RevealDomainObject) => boolean
): RevealDomainObject[] {
  return [
    ...filter(renderTarget.rootDomainObject.getDescendantsByType(RevealDomainObject), predicate)
  ];
}

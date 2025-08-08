import { type TranslationInput } from '../utilities/TranslateInput';

import { describe, test, expect, beforeEach } from 'vitest';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { DomainObjectPanelUpdater } from './DomainObjectPanelUpdater';
import { DomainObject } from '../domainObjects/DomainObject';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { Changes } from '../domainObjectsHelpers/Changes';
import { effect } from '@cognite/signals';

describe(DomainObjectPanelUpdater.name, () => {
  let domainObject: MockDomainObject;
  let renderTarget: RevealRenderTarget;
  let panelUpdater: DomainObjectPanelUpdater;

  beforeEach(() => {
    domainObject = new MockDomainObject();
    renderTarget = createFullRenderTargetMock();
    renderTarget.rootDomainObject.addChild(domainObject);
    panelUpdater = renderTarget.panelUpdater;
  });

  test('should set the selected domain object when domain object change selection', () => {
    expect(panelUpdater.selectedDomainObject()).toBeUndefined();
    domainObject.setSelectedInteractive(true);
    expect(panelUpdater.selectedDomainObject()).toBe(domainObject);
    domainObject.setSelectedInteractive(false);
    expect(panelUpdater.selectedDomainObject()).toBeUndefined();
  });

  test('should set the selected domain object tuo undefined when domain object is removed', () => {
    expect(panelUpdater.selectedDomainObject()).toBeUndefined();
    domainObject.setSelectedInteractive(true);
    expect(panelUpdater.selectedDomainObject()).toBe(domainObject);
    domainObject.removeInteractive();
    expect(panelUpdater.selectedDomainObject()).toBeUndefined();
  });

  test('should signal updates when the domain object is selected, geometry has changed or remove', () => {
    let selectedSignalUpdates = 0;
    effect(() => {
      panelUpdater.selectedDomainObject();
      selectedSignalUpdates++;
    });
    let updateSignalUpdates = 0;
    effect(() => {
      panelUpdater.update();
      updateSignalUpdates++;
    });
    selectedSignalUpdates = 0;
    updateSignalUpdates = 0;

    // Expect only selected signal to update when selecting
    domainObject.setSelectedInteractive(true);
    expect(selectedSignalUpdates).toBe(1);
    expect(updateSignalUpdates).toBe(0);

    // Expect only update signal to update when geometry change
    domainObject.notify(Changes.geometry);
    expect(selectedSignalUpdates).toBe(1);
    expect(updateSignalUpdates).toBe(1);

    // Expect only selected signal to update when domain object is removed
    domainObject.removeInteractive();
    expect(selectedSignalUpdates).toBe(2);
    expect(updateSignalUpdates).toBe(1);
  });
});

class MockDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Mock' };
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }
}

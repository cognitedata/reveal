/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { ExampleDomainObject } from '../ExampleDomainObject';
import { ShowAllExamplesCommand } from './ShowAllExamplesCommand';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { addExampleDomainObjects } from '../utilities.test';

describe(ShowAllExamplesCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    root = renderTarget.rootDomainObject;
  });

  test('Should have initial state', () => {
    const command = new ShowAllExamplesCommand();
    command.attach(renderTarget);

    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('EyeShow');
    expect(command.buttonType).toBe('ghost');
    expect(command.isEnabled).toBe(false);
    expect(command.isChecked).toBe(false);
    expect(command.isToggle).toBe(true);
    expect(command.getShortCutKeys()).toBeUndefined();
  });

  test('Should set all ExampleDomainObjects visible', () => {
    const command = new ShowAllExamplesCommand();
    command.attach(renderTarget);

    addExampleDomainObjects(root, 5);
    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(false);
    for (const descendant of root.getDescendantsByType(ExampleDomainObject)) {
      expect(descendant.isVisible(renderTarget)).toBe(false);
    }
    command.invoke();
    for (const descendant of root.getDescendantsByType(ExampleDomainObject)) {
      expect(descendant.isVisible(renderTarget)).toBe(true);
    }
    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(true);
  });
});

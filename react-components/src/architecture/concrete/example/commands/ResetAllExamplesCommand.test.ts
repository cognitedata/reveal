/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { ExampleDomainObject } from '../ExampleDomainObject';
import { ResetAllExamplesCommand } from './ResetAllExamplesCommand';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { addSomeExamples } from './DeleteAllExamplesCommand.test';

describe(ResetAllExamplesCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    root = renderTarget.rootDomainObject;
  });

  test('Should have initial state', () => {
    const command = new ResetAllExamplesCommand();
    command.attach(renderTarget);

    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('ClearAll');
    expect(command.buttonType).toBe('ghost');
    expect(command.isEnabled).toBe(false);
    expect(command.isChecked).toBe(false);
    expect(command.isToggle).toBe(false);
    expect(command.getShortCutKeys()).toBeUndefined();
  });

  test('Should reset the render style of all ExampleDomainObject to default', () => {
    const command = new ResetAllExamplesCommand();
    command.attach(renderTarget);

    addSomeExamples(root, 5);
    for (const descendant of root.getDescendantsByType(ExampleDomainObject)) {
      descendant.renderStyle.radius = 100;
    }
    expect(command.isEnabled).toBe(true);
    command.invoke();
    for (const descendant of root.getDescendantsByType(ExampleDomainObject)) {
      expect(descendant.renderStyle.radius).toBe(1);
    }
  });
});

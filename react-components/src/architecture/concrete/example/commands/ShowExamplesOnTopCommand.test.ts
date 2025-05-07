/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { ExampleDomainObject } from '../ExampleDomainObject';
import { ShowExamplesOnTopCommand } from './ShowExamplesOnTopCommand';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { addExampleDomainObjects } from '../utilities.test';

describe(ShowExamplesOnTopCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    root = renderTarget.rootDomainObject;
  });

  test('Should have initial state', () => {
    const command = new ShowExamplesOnTopCommand();
    command.attach(renderTarget);

    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Flag');
    expect(command.buttonType).toBe('ghost');
    expect(command.isEnabled).toBe(false);
    expect(command.isToggle).toBe(true);
    expect(command.getShortCutKeys()).toBeUndefined();
  });

  test('Should set all ExampleDomainObjects on top', () => {
    const command = new ShowExamplesOnTopCommand();
    command.attach(renderTarget);

    addExampleDomainObjects(root, 5);
    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(false);
    for (const descendant of root.getDescendantsByType(ExampleDomainObject)) {
      expect(descendant.renderStyle.depthTest).toBe(true);
    }
    command.invoke();
    for (const descendant of root.getDescendantsByType(ExampleDomainObject)) {
      expect(descendant.renderStyle.depthTest).toBe(false);
    }
    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(true);
  });
});

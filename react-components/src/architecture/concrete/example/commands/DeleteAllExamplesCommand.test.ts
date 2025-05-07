/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { DeleteAllExamplesCommand } from './DeleteAllExamplesCommand';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { addExampleDomainObjects, getNumberOfExampleDomainObjects } from '../utilities.test';

describe(DeleteAllExamplesCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    root = renderTarget.rootDomainObject;
  });

  test('Should have initial state', () => {
    const command = new DeleteAllExamplesCommand();
    command.attach(renderTarget);

    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Delete');
    expect(command.buttonType).toBe('ghost-destructive');
    expect(command.isEnabled).toBe(false);
    expect(command.isChecked).toBe(false);
    expect(command.isToggle).toBe(false);
    expect(command.getShortCutKeys()).toBeUndefined();
  });

  test('Should remove all ExampleDomainObjects', () => {
    const command = new DeleteAllExamplesCommand();
    command.attach(renderTarget);

    addExampleDomainObjects(root, 5);
    expect(command.isEnabled).toBe(true);
    expect(getNumberOfExampleDomainObjects(root)).toBe(5);
    command.invoke();
    expect(command.isEnabled).toBe(false);
    expect(getNumberOfExampleDomainObjects(root)).toBe(0);
  });
});

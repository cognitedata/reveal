/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { DeleteAllExamplesCommand } from './DeleteAllExamplesCommand';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { createExampleDomainObject } from '../ExampleDomainObject.test';
import { ExampleDomainObject } from '../ExampleDomainObject';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';

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

    addSomeExamples(root, 5);
    expect(command.isEnabled).toBe(true);
    expect(getNumberOfExamples(root)).toBe(5);
    command.invoke();
    expect(command.isEnabled).toBe(false);
    expect(getNumberOfExamples(root)).toBe(0);
  });
});

export function addSomeExamples(root: DomainObject, count: number): void {
  for (let i = 0; i < count; i++) {
    const domainObject = createExampleDomainObject();
    root.addChildInteractive(domainObject);
  }
}

function getNumberOfExamples(root: DomainObject): number {
  let count = 0;
  for (const _descendant of root.getDescendantsByType(ExampleDomainObject)) {
    count++;
  }
  return count;
}

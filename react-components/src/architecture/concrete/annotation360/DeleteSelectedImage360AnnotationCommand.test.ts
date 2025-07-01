import { beforeEach, describe, expect, test } from 'vitest';
import { DeleteSelectedImage360AnnotationCommand } from './DeleteSelectedImage360AnnotationCommand';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { addImage360Annotations, getNumberOfImage360Annotations } from './testUtilities';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';

describe(DeleteSelectedImage360AnnotationCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    root = renderTarget.rootDomainObject;
  });

  test('Should have initial state witch icon, tooltip etc', () => {
    const command = new DeleteSelectedImage360AnnotationCommand();
    command.attach(renderTarget);

    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('Delete');
    expect(command.getShortCutKeys()).toEqual(['Delete']);
    expect(command.buttonType).toBe('ghost-destructive');
    expect(command.isEnabled).toBe(false);
    expect(command.isChecked).toBe(false);
    expect(command.isToggle).toBe(false);
  });

  test('Should remove all Image360AnnotationDomainObjects', () => {
    const command = new DeleteSelectedImage360AnnotationCommand();
    command.attach(renderTarget);

    addImage360Annotations(root, 5);

    // Set them selected
    for (const domainObject of root.getDescendantsByType(Image360AnnotationDomainObject)) {
      domainObject.isSelected = true;
    }

    expect(command.isEnabled).toBe(true);
    expect(getNumberOfImage360Annotations(root)).toBe(5);

    command.invoke();
    expect(command.isEnabled).toBe(false);
    expect(getNumberOfImage360Annotations(root)).toBe(0);
  });
});

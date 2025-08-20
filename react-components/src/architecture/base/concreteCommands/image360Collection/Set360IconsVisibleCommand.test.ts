import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../utilities/translation/TranslateInput';
import { Set360IconsVisibleCommand } from './Set360IconsVisibleCommand';
import { createImage360ClassicMock } from '#test-utils//fixtures/image360';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';

describe(Set360IconsVisibleCommand.name, () => {
  let command: Set360IconsVisibleCommand;
  const renderTarget = createFullRenderTargetMock();
  const domainObject = new Image360CollectionDomainObject(createImage360ClassicMock());
  renderTarget.rootDomainObject.addChildInteractive(domainObject);

  beforeEach(() => {
    command = new Set360IconsVisibleCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should have the same value as the 360 image', () => {
    expect(command.isChecked).toBe(domainObject.isIconsVisible());
  });

  test('Should change icons visible at the 360 image', () => {
    const oldValue = domainObject.isIconsVisible();
    command.invoke();
    expect(domainObject.isIconsVisible()).not.toBe(oldValue);
    command.invoke();
    expect(domainObject.isIconsVisible()).toBe(oldValue);
  });
});

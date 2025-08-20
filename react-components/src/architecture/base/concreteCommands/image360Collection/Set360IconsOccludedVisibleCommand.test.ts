import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { beforeEach, describe, expect, test } from 'vitest';
import { Set360IconsOccludedVisibleCommand } from './Set360IconsOccludedVisibleCommand';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { isEmpty } from '../../utilities/translation/TranslateInput';

describe(Set360IconsOccludedVisibleCommand.name, () => {
  let command: Set360IconsOccludedVisibleCommand;
  const renderTarget = createFullRenderTargetMock();
  const domainObject = new Image360CollectionDomainObject(createImage360ClassicMock());
  renderTarget.rootDomainObject.addChildInteractive(domainObject);

  beforeEach(() => {
    command = new Set360IconsOccludedVisibleCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should have the same value as the 360 image', () => {
    expect(command.isChecked).toBe(domainObject.isOccludedIconsVisible());
  });

  test('Should change occluded icons visible at the 360 image', () => {
    const oldValue = domainObject.isOccludedIconsVisible();
    command.invoke();
    expect(domainObject.isOccludedIconsVisible()).not.toBe(oldValue);
    command.invoke();
    expect(domainObject.isOccludedIconsVisible()).toBe(oldValue);
  });
});

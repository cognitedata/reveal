import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../utilities/TranslateInput';
import { Set360IconsOpacityCommand } from './Set360IconsOpacityCommand';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';

describe(Set360IconsOpacityCommand.name, () => {
  let command: Set360IconsOpacityCommand;
  const renderTarget = createFullRenderTargetMock();
  const domainObject = new Image360CollectionDomainObject(createImage360ClassicMock());
  renderTarget.rootDomainObject.addChildInteractive(domainObject);

  beforeEach(() => {
    command = new Set360IconsOpacityCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should have the same value as the 360 image', () => {
    expect(command.value).toBe(domainObject.iconsOpacity());
  });

  test('Should change icons opacity at the 360 image', () => {
    const expectedValue = 3;
    expect(domainObject.iconsOpacity()).not.toBe(expectedValue);
    command.value = expectedValue;
    expect(domainObject.iconsOpacity()).toBe(expectedValue);
  });
});

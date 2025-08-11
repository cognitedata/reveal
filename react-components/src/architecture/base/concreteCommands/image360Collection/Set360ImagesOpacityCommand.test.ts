import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../utilities/TranslateInput';
import { Set360ImagesOpacityCommand } from './Set360ImagesOpacityCommand';
import { createImage360ClassicMock } from '../../../../../tests/tests-utilities/fixtures/image360';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';

describe(Set360ImagesOpacityCommand.name, () => {
  let command: Set360ImagesOpacityCommand;
  const renderTarget = createFullRenderTargetMock();
  const domainObject = new Image360CollectionDomainObject(createImage360ClassicMock());
  renderTarget.rootDomainObject.addChildInteractive(domainObject);

  beforeEach(() => {
    command = new Set360ImagesOpacityCommand();
    command.attach(renderTarget);
  });

  test('Should have correct initial state', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.isEnabled).toBe(true);
  });

  test('Should have the same value as the 360 image', () => {
    expect(command.value).toBe(domainObject.imagesOpacity());
  });

  test('Should change images opacity at the 360 image', () => {
    const expectedValue = 3;
    expect(domainObject.imagesOpacity()).not.toBe(expectedValue);
    command.value = expectedValue;
    expect(domainObject.imagesOpacity()).toBe(expectedValue);
  });
});

import { Image360CollectionDividerCommand } from './Image360CollectionDividerCommand';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { describe, expect, test } from 'vitest';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { Set360IconsSectionCommand } from './Set360IconsSectionCommand';
import { Set360ImagesSectionCommand } from './Set360ImagesSectionCommand';

describe('Misc 360 images commands', () => {
  test('Should be visible only when having 360 images', () => {
    const commands = [
      new Image360CollectionDividerCommand(),
      new Set360IconsSectionCommand(),
      new Set360ImagesSectionCommand()
    ];
    const renderTarget = createFullRenderTargetMock();
    for (const command of commands) {
      command.attach(renderTarget);
      expect(command.isVisible).toBe(false);
    }

    const domainObject = new Image360CollectionDomainObject(createImage360ClassicMock());
    renderTarget.rootDomainObject.addChildInteractive(domainObject);
    for (const command of commands) {
      expect(command.isVisible).toBe(true);
    }
  });
});

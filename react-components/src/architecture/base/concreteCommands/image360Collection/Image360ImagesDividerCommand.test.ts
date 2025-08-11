import { Image360ImagesDividerCommand } from './Image360ImagesDividerCommand';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { describe, expect, test } from 'vitest';
import { Image360CollectionDomainObject } from '../../../concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';

describe(Image360ImagesDividerCommand.name, () => {
  test('Should be visible only when having point clouds', () => {
    const command = new Image360ImagesDividerCommand();
    const renderTarget = createFullRenderTargetMock();
    command.attach(renderTarget);

    expect(command.isVisible).toBe(false);

    const domainObject = new Image360CollectionDomainObject(createImage360ClassicMock());
    renderTarget.rootDomainObject.addChildInteractive(domainObject);
    expect(command.isVisible).toBe(true);
  });
});

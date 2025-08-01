import { CadDividerCommand } from './CadDividerCommand';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { describe, expect, test } from 'vitest';
import { CadDomainObject } from '../../../concrete/reveal/cad/CadDomainObject';
import { createCadMock } from '../../../../../tests/tests-utilities/fixtures/cadModel';

describe(CadDividerCommand.name, () => {
  test('Should be visible only when having cad models', () => {
    const command = new CadDividerCommand();
    const renderTarget = createFullRenderTargetMock();
    command.attach(renderTarget);

    expect(command.isVisible).toBe(false);

    const domainObject = new CadDomainObject(createCadMock());
    renderTarget.rootDomainObject.addChildInteractive(domainObject);
    expect(command.isVisible).toBe(true);
  });
});

import { PointCloudDividerCommand } from './PointCloudDividerCommand';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { describe, expect, test } from 'vitest';
import { PointCloudDomainObject } from '../../../concrete/reveal/pointCloud/PointCloudDomainObject';
import { createPointCloudMock } from '../../../../../tests/tests-utilities/fixtures/pointCloud';

describe(PointCloudDividerCommand.name, () => {
  test('Should be visible only when having point clouds', () => {
    const command = new PointCloudDividerCommand();
    const renderTarget = createFullRenderTargetMock();
    command.attach(renderTarget);

    expect(command.isVisible).toBe(false);

    const domainObject = new PointCloudDomainObject(createPointCloudMock());
    renderTarget.rootDomainObject.addChildInteractive(domainObject);
    expect(command.isVisible).toBe(true);
  });
});

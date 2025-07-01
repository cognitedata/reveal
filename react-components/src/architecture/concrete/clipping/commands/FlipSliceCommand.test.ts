import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { SliceDomainObject } from '../SliceDomainObject';
import { FlipSliceCommand } from './FlipSliceCommand';
import { Vector3 } from 'three';

const NORMAL = new Vector3(1, 2, 0);

describe(FlipSliceCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: FlipSliceCommand;
  let domainObject: SliceDomainObject;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    domainObject = new SliceDomainObject(PrimitiveType.PlaneXY);
    domainObject.plane.normal.copy(NORMAL);
    command = new FlipSliceCommand(domainObject);
    command.attach(renderTarget);
  });

  test('Should have tooltip, icon and be enabled', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).not.toBe('');
    expect(command.isEnabled).toBe(true);
  });

  test('Should flip the plane and notify', () => {
    const eventListener = vi.fn();
    domainObject.views.addEventListener(eventListener);
    command.invoke();
    expect(domainObject.plane.normal.equals(NORMAL.clone().negate())).toBe(true);
    expect(eventListener).toHaveBeenCalledTimes(1);
  });
});

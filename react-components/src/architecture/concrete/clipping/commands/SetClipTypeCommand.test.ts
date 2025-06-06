import { beforeEach, describe, expect, test } from 'vitest';
import { SetClipTypeCommand } from './SetClipTypeCommand';
import {
  AlongAxisPlanePrimitiveTypes,
  PrimitiveType
} from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { ClipTool } from '../ClipTool';
import { getDefaultCommand } from '../../../../components/Architecture/utilities';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { SliceDomainObject } from '../SliceDomainObject';
import { lastElement } from '../../../base/utilities/extensions/arrayExtensions';

describe(SetClipTypeCommand.name, () => {
  let renderTarget: RevealRenderTarget;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    const root = renderTarget.rootDomainObject;

    // Add some planes and set the last one selected
    for (const domainObject of getPlanesOfAllType()) {
      root.addChild(domainObject);
    }
    const last = lastElement(root.children);
    last?.setSelectedInteractive(true);
  });

  test('Should have default behavior when active tool is not ClipTool', () => {
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(isEmpty(command.tooltip)).toBe(false);
      expect(command.icon).not.toBe('');
      expect(command.isVisible).toBe(true);
      expect(command.isEnabled).toBe(false);
      expect(command.isChecked).toBe(false);
    }
  });

  test('Should be enabled when active tool is ClipTool', () => {
    // Set the active tool to ClipTool
    const tool = getDefaultCommand(new ClipTool(), renderTarget);
    renderTarget.commandsController.setActiveTool(tool);

    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(command.isEnabled).toBe(true);
    }
  });

  test('Should be not be enable enabled when active tool is ClipTool and more than 1 planes along the axis', () => {
    // Set the active tool to ClipTool
    const tool = getDefaultCommand(new ClipTool(), renderTarget);
    renderTarget.commandsController.setActiveTool(tool);

    // Add extra set of planes
    const root = renderTarget.rootDomainObject;
    for (const domainObject of getPlanesOfAllType()) {
      root.addChild(domainObject);
    }
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      const expectEnabled = !AlongAxisPlanePrimitiveTypes.includes(newCommand.primitiveType);
      expect(command.isEnabled).toBe(expectEnabled);
    }
  });
});

function* getCommands(): Generator<SetClipTypeCommand> {
  yield new SetClipTypeCommand(PrimitiveType.PlaneX);
  yield new SetClipTypeCommand(PrimitiveType.PlaneY);
  yield new SetClipTypeCommand(PrimitiveType.PlaneZ);
  yield new SetClipTypeCommand(PrimitiveType.PlaneXY);
  yield new SetClipTypeCommand(PrimitiveType.Box);
}

function* getPlanesOfAllType(): Generator<SliceDomainObject> {
  yield new SliceDomainObject(PrimitiveType.PlaneX);
  yield new SliceDomainObject(PrimitiveType.PlaneY);
  yield new SliceDomainObject(PrimitiveType.PlaneZ);
  yield new SliceDomainObject(PrimitiveType.PlaneXY);
}

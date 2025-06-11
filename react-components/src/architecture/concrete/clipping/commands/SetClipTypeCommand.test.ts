import { beforeEach, describe, expect, test } from 'vitest';
import { ClipTool } from '../ClipTool';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { getDefaultCommand } from '../../../../components/Architecture/utilities';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { lastElement } from '../../../base/utilities/extensions/arrayExtensions';
import { SetClipTypeCommand } from './SetClipTypeCommand';
import { SliceDomainObject } from '../SliceDomainObject';
import {
  AlongAxisPlanePrimitiveTypes,
  PlanePrimitiveTypes,
  PrimitiveType
} from '../../../base/utilities/primitives/PrimitiveType';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';

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

  test('Should have tooltip and icon', () => {
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(isEmpty(command.tooltip)).toBe(false);
      expect(command.icon).not.toBe('');
    }
  });

  test('Should be disabled and not checked when active tool is not ClipTool', () => {
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(command.isEnabled).toBe(false);
      expect(command.isChecked).toBe(false);
    }
  });

  test('Should be enabled when active tool is ClipTool', () => {
    createActiveClipTool(renderTarget);
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(command.isEnabled).toBe(true);
    }
  });

  test('Should be not be enable when active tool is ClipTool and more than 1 planes along the axis', () => {
    createActiveClipTool(renderTarget);
    // Add extra set of planes so it is 2 of each type
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
  test('Should set primitiveType on active tool', () => {
    const tool = createActiveClipTool(renderTarget);
    // Add extra set of planes
    const root = renderTarget.rootDomainObject;
    for (const domainObject of getPlanesOfAllType()) {
      root.addChild(domainObject);
    }
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);

      expect(command.isChecked).toBe(false);
      expect(command.primitiveType).not.toBe(tool.primitiveType);
      command.invoke();
      expect(command.isChecked).toBe(true);
      expect(command.primitiveType).toBe(tool.primitiveType);
    }
  });
});

function* getCommands(): Generator<SetClipTypeCommand> {
  for (const primitiveType of PlanePrimitiveTypes) {
    yield new SetClipTypeCommand(primitiveType);
  }
  yield new SetClipTypeCommand(PrimitiveType.Box);
}

function* getPlanesOfAllType(): Generator<DomainObject> {
  for (const primitiveType of PlanePrimitiveTypes) {
    yield new SliceDomainObject(primitiveType);
  }
}

function createActiveClipTool(renderTarget: RevealRenderTarget): ClipTool {
  const tool = getDefaultCommand(new ClipTool(), renderTarget);
  renderTarget.commandsController.setActiveTool(tool);
  return tool;
}

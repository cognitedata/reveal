import { beforeEach, describe, expect, test } from 'vitest';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { getDefaultCommand } from '../../../../components/Architecture/utilities';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { MEASURE_PRIMITIVE_TYPES, SetMeasurementTypeCommand } from './SetMeasurementTypeCommand';
import { MeasurementTool } from '../MeasurementTool';

describe(SetMeasurementTypeCommand.name, () => {
  let renderTarget: RevealRenderTarget;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
  });

  test('Should throw when illegal PrimitiveType is given in the constructor', () => {
    expect(() => {
      const _ = new SetMeasurementTypeCommand(PrimitiveType.PlaneX);
    }).toThrow();
  });

  test('Should have tooltip and icon', () => {
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(isEmpty(command.tooltip)).toBe(false);
      expect(command.icon).not.toBe('');
    }
  });

  test('Should be disabled and not checked when active tool is not MeasurementTool', () => {
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(command.isEnabled).toBe(false);
      expect(command.isChecked).toBe(false);
    }
  });

  test('Should be enabled when active tool is MeasurementTool', () => {
    createActiveTool(renderTarget);
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);
      expect(command.isEnabled).toBe(true);
    }
  });

  test('Should set and clear primitiveType on active tool', () => {
    const tool = createActiveTool(renderTarget);
    for (const newCommand of getCommands()) {
      const command = getDefaultCommand(newCommand, renderTarget);

      // Check initial state
      expect(command.isChecked).toBe(false);
      expect(tool.primitiveType).not.toBe(command.primitiveType);

      // Set primitive type
      command.invoke();
      expect(command.isChecked).toBe(true);
      expect(tool.primitiveType).toBe(command.primitiveType);

      // Clear primitive type
      command.invoke();
      expect(command.isChecked).toBe(false);
      expect(tool.primitiveType).toBe(PrimitiveType.None);
    }
  });
});

function* getCommands(): Generator<SetMeasurementTypeCommand> {
  for (const primitiveType of MEASURE_PRIMITIVE_TYPES) {
    yield new SetMeasurementTypeCommand(primitiveType);
  }
}

function createActiveTool(renderTarget: RevealRenderTarget): MeasurementTool {
  const tool = getDefaultCommand(new MeasurementTool(), renderTarget);
  renderTarget.commandsController.setActiveTool(tool);
  return tool;
}

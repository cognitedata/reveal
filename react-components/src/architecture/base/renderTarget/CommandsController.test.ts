import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { CommandsController } from './CommandsController';
import { BaseTool } from '../commands/BaseTool';
import { type RevealRenderTarget } from './RevealRenderTarget';
import { createRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/renderTarget';
import { BaseCommand } from '../commands/BaseCommand';
import { CommandChanges } from '../domainObjectsHelpers/CommandChanges';
import { MOUSE } from 'three';

describe(CommandsController.name, () => {
  let renderTarget: RevealRenderTarget;
  let controller: CommandsController;
  let domElement: HTMLElement;

  beforeEach(() => {
    renderTarget = createRenderTargetMock();
    domElement = document.createElement('div');
    controller = new CommandsController(domElement);
    controller.addEventListeners();
  });

  afterEach(() => {
    controller.removeEventListeners();
    controller.dispose();
  });

  test('Should be enabled', () => {
    expect(controller.isEnabled).toBe(true);
  });

  describe('Test active, default and previous tool tool', () => {
    test('Should set default tool', () => {
      const mockTool = createMockTool1();
      controller.setDefaultTool(undefined);
      expect(controller.defaultTool).toBeUndefined();
      controller.setDefaultTool(mockTool);
      expect(controller.defaultTool).toBe(mockTool);
    });

    test('Should set default tool as active', () => {
      const mockTool1 = createMockTool1();
      const mockTool2 = createMockTool2();

      controller.activateDefaultTool();
      expect(controller.activeTool).toBeUndefined();

      controller.setDefaultTool(mockTool1);
      controller.setActiveTool(mockTool2);
      expect(controller.activeTool).toBe(mockTool2);
      controller.activateDefaultTool();
      expect(controller.activeTool).toBe(mockTool1);
      expect(controller.isDefaultToolActive).toBe(true);
    });

    test('Should set previous active tool as active', () => {
      const mockTool1 = createMockTool1();
      const mockTool2 = createMockTool2();
      controller.setActiveTool(mockTool1);
      controller.setPreviousTool();
      expect(controller.activeTool).toBe(mockTool1);
      controller.setActiveTool(mockTool2);
      expect(controller.activeTool).toBe(mockTool2);
      controller.setPreviousTool();
      expect(controller.activeTool).toBe(mockTool1);
    });

    test('Should set active tool and check if it is updating', () => {
      const mockTool1 = createMockTool1();
      const mockTool2 = createMockTool2();

      const activateTester1 = new UpdateTester(mockTool1, CommandChanges.active);
      const deactivateTester1 = new UpdateTester(mockTool1, CommandChanges.deactive);
      const activateTester2 = new UpdateTester(mockTool2, CommandChanges.active);
      const deactivateTester2 = new UpdateTester(mockTool2, CommandChanges.deactive);

      controller.setActiveTool(mockTool1);
      expect(controller.activeTool).toBe(mockTool1);
      expect(controller.activeToolSignal()).toBe(mockTool1);

      expect(activateTester1.calledTimes).toBe(1);
      expect(deactivateTester1.calledTimes).toBe(0);

      controller.setActiveTool(mockTool2);
      expect(controller.activeTool).toBe(mockTool2);

      controller.setActiveTool(undefined);
      expect(controller.activeTool).toBe(mockTool2);

      expect(activateTester1.calledTimes).toBe(1);
      expect(deactivateTester1.calledTimes).toBe(1);
      expect(activateTester2.calledTimes).toBe(1);
      expect(deactivateTester2.calledTimes).toBe(0);
    });

    test('Should not changed active tool when undefined or the same tool is given', () => {
      const mockTool = createMockTool1();

      controller.setActiveTool(mockTool);
      expect(controller.activeTool).toBe(mockTool);

      controller.setActiveTool(undefined);
      expect(controller.activeTool).toBe(mockTool);

      controller.setActiveTool(mockTool);
      expect(controller.activeTool).toBe(mockTool);
    });

    test('Should activate by tool type', () => {
      const mockTool1 = createMockTool1();
      const mockTool2 = createMockTool2();

      controller.setActiveToolByType(MockTool1);
      expect(controller.activeTool).toBeUndefined();

      controller.add(mockTool1);
      controller.add(mockTool2);

      for (let i = 0; i < 2; i++) {
        controller.setActiveToolByType(MockTool1);
        expect(controller.activeTool).toBe(mockTool1);

        controller.setActiveToolByType(MockTool2);
        expect(controller.activeTool).toBe(mockTool2);
      }
    });
  });

  describe('Test getters', () => {
    test('Should get tool by type', () => {
      const mockTool1 = createMockTool1();
      const mockTool2 = createMockTool2();

      expect(controller.getToolByType(MockTool1)).toBeUndefined();
      expect(controller.getToolByType(MockTool2)).toBeUndefined();

      controller.add(mockTool1);
      controller.add(mockTool2);

      expect(controller.getToolByType(MockTool1)).toBe(mockTool1);
      expect(controller.getToolByType(MockTool2)).toBe(mockTool2);
    });

    test('Should get command by type', () => {
      const mockTool = createMockTool1();
      const mockCommand = new MockCommand();

      expect(controller.getCommandByTypeRecursive(MockTool1)).toBeUndefined();
      expect(controller.getCommandByTypeRecursive(MockCommand)).toBeUndefined();

      controller.add(mockTool);
      controller.add(mockCommand);

      expect(controller.getCommandByTypeRecursive(MockTool1)).toBe(mockTool);
      expect(controller.getCommandByTypeRecursive(MockCommand)).toBe(mockCommand);
    });

    test('Should get the existing and equal command', () => {
      const mockTool = createMockTool1();
      const mockCommand = new MockCommand();

      expect(controller.getEqual(new MockCommand())).toBeUndefined();
      expect(controller.getEqual(new MockTool1())).toBeUndefined();

      controller.add(mockTool);
      controller.add(mockCommand);

      expect(controller.getEqual(new MockCommand())).toBe(mockCommand);
      expect(controller.getEqual(new MockTool1())).toBe(mockTool);
    });
  });

  describe('Test shortcuts', () => {
    test('Should invoke on correct shortcut and not invoke when incorrect shortcut', () => {
      const mockCommand = new MockCommand();
      controller.add(mockCommand);

      for (const correct of [true, false]) {
        const invokeMock = vi.fn();
        mockCommand.invoke = invokeMock;

        const event = createKeyboardEvent(correct ? 'A' : 'B');
        expect(invokeMock).toHaveBeenCalledTimes(0);
        controller.onKey(event, true); // Key down

        const expectedTimes = correct ? 1 : 0;
        expect(invokeMock).toHaveBeenCalledTimes(expectedTimes);
        controller.onKey(event, false); // key up
        expect(invokeMock).toHaveBeenCalledTimes(expectedTimes);
      }
    });

    test('Should call onKey on the active tool when any shortcut is pressed', () => {
      const mockTool = createMockTool1();
      controller.setActiveTool(mockTool);

      const onKeyMock = vi.fn();
      mockTool.onKey = onKeyMock;

      const event = createKeyboardEvent('A');
      controller.onKey(event, true);
      expect(onKeyMock).toHaveBeenCalledTimes(1);
      controller.onKey(event, false);
      expect(onKeyMock).toHaveBeenCalledTimes(2);
    });

    test('Should call onDeleteKey on the active tool when Delete key is pressed', () => {
      const mockTool = createMockTool1();
      controller.setActiveTool(mockTool);

      const onDeleteKeyMock = vi.fn();
      mockTool.onDeleteKey = onDeleteKeyMock;

      expect(onDeleteKeyMock).toHaveBeenCalledTimes(0);
      controller.onKey(createDeleteKeyEvent(), true);
      expect(onDeleteKeyMock).toHaveBeenCalledTimes(1);
    });

    test('Should call onEscapeKey on the active tool when Escape key is pressed', () => {
      const mockTool = createMockTool1();
      controller.setActiveTool(mockTool);

      const onEscapeKeyMock = vi.fn();
      mockTool.onEscapeKey = onEscapeKeyMock;

      expect(onEscapeKeyMock).toHaveBeenCalledTimes(0);
      controller.onKey(createEscapeKeyEvent(), true);
      expect(onEscapeKeyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test update', () => {
    test('Should all commands when the command controller updates', () => {
      const mockCommand = new MockCommand();
      const mockTool = createMockTool1();
      controller.add(mockCommand);
      controller.add(mockTool);

      const updateTester1 = new UpdateTester(mockCommand);
      const updateTester2 = new UpdateTester(mockTool);

      expect(updateTester1.calledTimes).toBe(0);
      expect(updateTester2.calledTimes).toBe(0);
      controller.update();
      expect(updateTester1.calledTimes).toBe(1);
      expect(updateTester2.calledTimes).toBe(1);
    });

    test('Should not update wnen disposed', () => {
      const mockCommand = new MockCommand();
      controller.add(mockCommand);

      const updateTester = new UpdateTester(mockCommand);

      expect(updateTester.calledTimes).toBe(0);
      controller.dispose();
      controller.update();
      expect(updateTester.calledTimes).toBe(0);
    });
  });

  describe('Test some event with dispatch the event on the dom element', () => {
    test('Should invoke on correct shortcut', () => {
      const mockCommand = new MockCommand();
      controller.add(mockCommand);

      const invokeMock = vi.fn();
      mockCommand.invoke = invokeMock;

      domElement.dispatchEvent(createKeyboardEvent('A'));
      expect(invokeMock).toHaveBeenCalledTimes(1);
      domElement.dispatchEvent(createKeyboardEvent('A', false));
      expect(invokeMock).toHaveBeenCalledTimes(1);
    });

    test('Should invoke on correct shortcut', () => {
      const mockTool = createMockTool1();
      controller.setActiveTool(mockTool);

      const onFocusChangedMock = vi.fn();
      mockTool.onFocusChanged = onFocusChangedMock;

      domElement.dispatchEvent(new FocusEvent('focus'));
      domElement.dispatchEvent(new FocusEvent('blur'));

      expect(onFocusChangedMock).toHaveBeenNthCalledWith(1, true);
      expect(onFocusChangedMock).toHaveBeenNthCalledWith(2, false);
    });

    test('Should call onWheel when wheel event', () => {
      const mockTool = createMockTool1();
      controller.setActiveTool(mockTool);

      const onWheelMock = vi.fn();
      mockTool.onWheel = onWheelMock;

      domElement.dispatchEvent(new WheelEvent('wheel'));
      expect(onWheelMock).toHaveBeenCalledTimes(1);
    });

    test('Should call onHover when hover event', () => {
      const mockTool = createMockTool1();
      controller.setActiveTool(mockTool);

      const onHoverMock = vi.fn();
      mockTool.onHover = onHoverMock;

      domElement.dispatchEvent(createMouseHoverEvent());
      expect(onHoverMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test some event with the event function at the controller itself', () => {
    test('Should call correct function on the correct tool on hover event', async () => {
      const activeTool = createMockTool1();
      controller.setActiveTool(activeTool);

      const mock = vi.fn();
      activeTool.onHoverByDebounce = mock;
      controller.onHover(createMouseHoverEvent());
      expect(mock).toHaveBeenCalledTimes(1);
    });

    test('Should call correction function on the correct tool on click', async () => {
      const activeTool = createMockTool1();
      controller.setActiveTool(activeTool);

      const mock = vi.fn();
      activeTool.onClick = mock;
      await controller.onClick(createClickEvent());
      expect(mock).toHaveBeenCalledTimes(1);
    });

    test('Should call correction function on the correct tool on double click', async () => {
      const activeTool = createMockTool1();
      controller.setActiveTool(activeTool);

      const mock = vi.fn();
      activeTool.onDoubleClick = mock;
      await controller.onDoubleClick(createDoubleClickEvent());
      expect(mock).toHaveBeenCalledTimes(1);
    });

    test('Should call correction function on the correct tool on mouse down', async () => {
      const defaultTool = createMockTool2();
      const activeTool = createMockTool1();
      controller.setDefaultTool(defaultTool);
      controller.setActiveTool(activeTool);

      for (const isLeftButton of [false, true]) {
        const mock = vi.fn();
        if (isLeftButton) {
          activeTool.onLeftPointerDown = mock;
        } else {
          defaultTool.onRightPointerDown = mock;
        }
        await controller.onPointerDown(createMouseDownEvent(isLeftButton), isLeftButton);
        expect(mock).toHaveBeenCalledTimes(1);
      }
    });

    test('Should call correction function on the correct tool on mouse drag', async () => {
      const defaultTool = createMockTool2();
      const activeTool = createMockTool1();
      controller.setDefaultTool(defaultTool);
      controller.setActiveTool(activeTool);

      for (const isLeftButton of [false, true]) {
        const mock = vi.fn();
        if (isLeftButton) {
          activeTool.onLeftPointerDrag = mock;
        } else {
          defaultTool.onRightPointerDrag = mock;
        }
        await controller.onPointerDrag(createMouseMoveEvent(isLeftButton), isLeftButton);
        expect(mock).toHaveBeenCalledTimes(1);
      }
    });

    test('Should call correction function on the correct tool on mouse up', async () => {
      const defaultTool = createMockTool2();
      const activeTool = createMockTool1();
      controller.setDefaultTool(defaultTool);
      controller.setActiveTool(activeTool);

      for (const isLeftButton of [false, true]) {
        const mock = vi.fn();
        if (isLeftButton) {
          activeTool.onLeftPointerUp = mock;
        } else {
          defaultTool.onRightPointerUp = mock;
        }
        await controller.onPointerUp(createMouseUpEvent(isLeftButton), isLeftButton);
        expect(mock).toHaveBeenCalledTimes(1);
      }
    });
  });

  function createMockTool1(): MockTool1 {
    const tool = new MockTool1();
    tool.attach(renderTarget);
    return tool;
  }
  function createMockTool2(): MockTool2 {
    const tool = new MockTool2();
    tool.attach(renderTarget);
    return tool;
  }
});

class MockTool1 extends BaseTool {}
class MockTool2 extends BaseTool {}

class MockCommand extends BaseCommand {
  protected override get shortCutKey(): string | undefined {
    return 'A';
  }

  protected override get shortCutKeyOnAlt(): boolean {
    return true;
  }

  protected override get shortCutKeyOnCtrl(): boolean {
    return true;
  }

  protected override get shortCutKeyOnShift(): boolean {
    return true;
  }
}

class UpdateTester {
  public calledTimes = 0;

  public constructor(command: BaseCommand, change?: symbol) {
    const listener = (_command: BaseCommand, inputChange?: symbol): void => {
      if (change === inputChange) {
        this.calledTimes++;
      }
    };
    command.addEventListener(listener);
  }
}

function createKeyboardEvent(key: string, keydown = true): KeyboardEvent {
  return new KeyboardEvent(keydown ? 'keydown' : 'keyup', {
    key,
    ctrlKey: true,
    shiftKey: true,
    altKey: true
  });
}

function createDeleteKeyEvent(): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Delete' });
}

function createEscapeKeyEvent(): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Escape' });
}

function createClickEvent(): PointerEvent {
  return new PointerEvent('click', { button: MOUSE.LEFT });
}

function createDoubleClickEvent(): PointerEvent {
  return new PointerEvent('dblclick', { button: MOUSE.LEFT });
}

function createMouseHoverEvent(): PointerEvent {
  return new PointerEvent('pointermove');
}

function createMouseMoveEvent(isLeftButton: boolean): PointerEvent {
  return new PointerEvent('pointermove', {
    button: isLeftButton ? MOUSE.LEFT : MOUSE.RIGHT
  });
}

function createMouseDownEvent(isLeftButton: boolean): PointerEvent {
  return new PointerEvent('pointerdown', {
    button: isLeftButton ? MOUSE.LEFT : MOUSE.RIGHT
  });
}

function createMouseUpEvent(isLeftButton: boolean): PointerEvent {
  return new PointerEvent('pointerup', {
    button: isLeftButton ? MOUSE.LEFT : MOUSE.RIGHT
  });
}

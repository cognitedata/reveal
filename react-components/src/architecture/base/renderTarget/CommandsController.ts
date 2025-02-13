/*!
 * Copyright 2024 Cognite AS
 * CommandsController: Holds the tools, the active tool and the previous tool
 */

import { PointerEvents, PointerEventsTarget, getWheelEventDelta } from '@cognite/reveal';
import { type BaseTool } from '../commands/BaseTool';
import { type BaseCommand } from '../commands/BaseCommand';
import { type Class, isInstanceOf } from '../domainObjectsHelpers/Class';
import { type Signal, signal } from '@cognite/signals';

export class CommandsController extends PointerEvents {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _activeTool = signal<BaseTool | undefined>();
  private _defaultTool: BaseTool | undefined;
  private _previousTool: BaseTool | undefined;
  private readonly _domElement: HTMLElement;
  private readonly _commands = new Set<BaseCommand>();
  private readonly _pointerEventsTarget: PointerEventsTarget;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(domElement: HTMLElement) {
    super();
    this._domElement = domElement;
    this._pointerEventsTarget = new PointerEventsTarget(this._domElement, this);
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get activeTool(): BaseTool | undefined {
    return this._activeTool();
  }

  public get activeToolSignal(): Signal<BaseTool | undefined> {
    return this._activeTool;
  }

  public get defaultTool(): BaseTool | undefined {
    return this._defaultTool;
  }

  public get isDefaultToolActive(): boolean {
    return this.activeTool === this.defaultTool;
  }

  // ================================================
  // OVERRIDES of PointerEvents
  // ================================================

  public override get isEnabled(): boolean {
    return true;
  }

  public override onHover(event: PointerEvent): void {
    // This override is actually with Debounce
    this.activeTool?.onHoverByDebounce(event);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    this._domElement.focus();
    await this.activeTool?.onClick(event);
  }

  public override async onDoubleClick(event: PointerEvent): Promise<void> {
    this._domElement.focus();
    await this.activeTool?.onDoubleClick(event);
  }

  public override async onPointerDown(event: PointerEvent, leftButton: boolean): Promise<void> {
    this._domElement.focus();
    if (leftButton) {
      await this.activeTool?.onLeftPointerDown(event);
    } else {
      await this.defaultTool?.onRightPointerDown(event);
    }
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (leftButton) {
      await this.activeTool?.onLeftPointerDrag(event);
    } else {
      await this.defaultTool?.onRightPointerDrag(event);
    }
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    if (leftButton) {
      await this.activeTool?.onLeftPointerUp(event);
    } else {
      await this.defaultTool?.onRightPointerUp(event);
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getEqual(command: BaseCommand): BaseCommand | undefined {
    // For some reason Set<> doesn't have find!
    for (const oldCommand of this._commands) {
      if (oldCommand.equals(command)) {
        return oldCommand;
      }
    }
    return undefined;
  }

  public add(command: BaseCommand): void {
    this._commands.add(command);
  }

  public setPreviousTool(): boolean {
    if (this._previousTool === undefined) {
      return false;
    }
    return this.setActiveTool(this._previousTool);
  }

  public setDefaultTool(tool: BaseTool | undefined): boolean {
    if (tool === undefined) {
      return false;
    }
    this._defaultTool = tool;
    return this.activateDefaultTool();
  }

  public getToolByType<T extends BaseTool>(classType: Class<T>): T | undefined {
    for (const tool of this._commands) {
      if (isInstanceOf(tool, classType)) {
        return tool;
      }
    }
    return undefined;
  }

  public getCommandByTypeRecursive<T extends BaseCommand>(classType: Class<T>): T | undefined {
    for (const command of this._commands) {
      if (isInstanceOf(command, classType)) {
        return command;
      }
      for (const descendant of command.getDescendants()) {
        if (isInstanceOf(descendant, classType)) {
          return descendant;
        }
      }
    }
    return undefined;
  }

  public setActiveToolByType<T extends BaseTool>(classType: Class<T>): boolean {
    for (const tool of this._commands) {
      if (isInstanceOf(tool, classType)) {
        return this.setActiveTool(tool);
      }
    }
    return false;
  }

  public activateDefaultTool(): boolean {
    if (this._defaultTool === undefined) {
      return false;
    }
    return this.setActiveTool(this._defaultTool);
  }

  public setActiveTool(tool: BaseTool | undefined): boolean {
    if (tool === undefined) {
      return false;
    }
    const prevActiveTool = this.activeTool;
    if (prevActiveTool === tool) {
      return false;
    }
    if (prevActiveTool !== undefined) {
      this._activeTool(undefined);
      prevActiveTool?.onDeactivate();
      this._previousTool = prevActiveTool;
    }
    this._activeTool(tool);
    this._activeTool()?.onActivate();
    return true;
  }

  public update(): void {
    for (const command of this._commands) {
      command.update();
    }
  }

  public dispose(): void {
    for (const command of this._commands) {
      command.dispose();
    }
  }

  // ================================================
  // INSTANCE METHODS: Other events
  // ================================================

  public onKey(event: KeyboardEvent, down: boolean): void {
    // code – the “key code” ("KeyA", "ArrowLeft" and so on), specific to the physical location of the key on keyboard.
    // key – the character ("A", "a" and so on), for non-character keys, such as Esc, usually has the same value as code.
    if (down) {
      const key = event.key.toUpperCase();
      const ctrlKey = event.ctrlKey || event.metaKey;

      for (const command of this._commands) {
        if (command.hasShortCutKey(key, ctrlKey, event.shiftKey, event.altKey)) {
          command.invoke();
          return;
        }
      }
    }
    if (down && (event.key === 'Delete' || event.key === 'Backspace')) {
      this.activeTool?.onDeleteKey();
    } else if (down && event.key === 'Escape') {
      this.activeTool?.onEscapeKey();
    } else {
      this.activeTool?.onKey(event, down);
    }
  }

  // ==================================================
  // INSTANCE METHODS: Add and remove listeners
  // ==================================================

  public addEventListeners(): void {
    // https://www.w3schools.com/jsref/obj_mouseevent.asp
    const domElement = this._domElement;
    domElement.addEventListener('pointermove', this._onPointerMove);
    domElement.addEventListener('keydown', this._onKeyDown);
    domElement.addEventListener('keyup', this._onKeyUp);
    domElement.addEventListener('wheel', this._onWheel);
    domElement.addEventListener('focus', this._onFocus);
    domElement.addEventListener('blur', this._onBlur);
    domElement.addEventListener('contextmenu', this._onContextMenu);
    this._pointerEventsTarget.addEventListeners();
  }

  public removeEventListeners(): void {
    const domElement = this._domElement;
    domElement.removeEventListener('pointermove', this._onPointerMove);
    domElement.removeEventListener('keydown', this._onKeyDown);
    domElement.removeEventListener('keyup', this._onKeyUp);
    domElement.removeEventListener('wheel', this._onWheel);
    domElement.removeEventListener('focus', this._onFocus);
    domElement.removeEventListener('blur', this._onBlur);
    domElement.removeEventListener('contextmenu', this._onContextMenu);
    this._pointerEventsTarget.removeEventListeners();
    for (const commands of this._commands) {
      commands.removeEventListeners();
    }
  }

  // ==================================================
  // INSTANCE METHODS: Events
  // ==================================================

  private readonly _onPointerMove = (event: PointerEvent): void => {
    if (event.buttons === 0) {
      this.activeTool?.onHover(event);
    }
  };

  private readonly _onKeyDown = (event: KeyboardEvent): void => {
    this.onKey(event, true);
  };

  private readonly _onContextMenu = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
  };

  private readonly _onKeyUp = (event: KeyboardEvent): void => {
    this.onKey(event, false);
  };

  private readonly _onWheel = async (event: WheelEvent): Promise<void> => {
    const delta = getWheelEventDelta(event);
    await this.activeTool?.onWheel(event, delta);
    event.stopPropagation();
    event.preventDefault();
  };

  private readonly _onFocus = (_event: FocusEvent): void => {
    this.activeTool?.onFocusChanged(true);
  };

  private readonly _onBlur = (_event: FocusEvent): void => {
    this.activeTool?.onFocusChanged(false);
  };
}

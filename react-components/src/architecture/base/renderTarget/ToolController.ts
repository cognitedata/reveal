/*!
 * Copyright 2024 Cognite AS
 * ToolController: Holds the tools, the active tool and the previous tool
 */

import { PointerEvents, PointerEventsTarget } from '@cognite/reveal';
import { type BaseTool } from '../commands/BaseTool';
import { type BaseCommand } from '../commands/BaseCommand';

export class ToolControllers extends PointerEvents {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _activeTool: BaseTool | undefined;
  private _defaultTool: BaseTool | undefined;
  private _previousTool: BaseTool | undefined;
  private readonly _domElement: HTMLElement;
  private readonly _commands = new Set<BaseCommand>();
  private readonly _pointerEventsTarget: PointerEventsTarget;

  // ==================================================
  // CONTRUCTORS
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
    return this._activeTool;
  }

  // ================================================
  // OVERRIDES of PointerEvents
  // ================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public override get isEnabled(): boolean {
    return true;
  }

  public override onHover(event: PointerEvent): void {
    this.activeTool?.onHover(event);
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
    await this.activeTool?.onPointerDown(event, leftButton);
  }

  public override async onPointerUp(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.activeTool?.onPointerUp(event, leftButton);
  }

  public override async onPointerDrag(event: PointerEvent, leftButton: boolean): Promise<void> {
    await this.activeTool?.onPointerDrag(event, leftButton);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getEqual(command: BaseCommand): BaseCommand | undefined {
    // For some reason Set<> doesn't have find!
    for (const oldCommand of this._commands) {
      if (oldCommand.equal(command)) {
        return oldCommand;
      }
    }
    return undefined;
  }

  public add(command: BaseCommand): void {
    this._commands.add(command);
  }

  public setPreviousTool(): void {
    if (this._previousTool !== undefined) {
      this.setActiveTool(this._previousTool);
    }
  }

  public setDefaultTool(tool: BaseTool | undefined): void {
    if (tool === undefined) {
      return;
    }
    this._defaultTool = tool;
    this.activateDefaultTool();
  }

  public activateDefaultTool(): void {
    if (this._defaultTool === undefined) {
      return;
    }
    this.setActiveTool(this._defaultTool);
  }

  public setActiveTool(tool: BaseTool | undefined): void {
    if (tool === undefined) {
      return;
    }
    const prevActiveTool = this._activeTool;
    if (prevActiveTool === tool) {
      return;
    }
    if (prevActiveTool !== undefined) {
      this._activeTool = undefined;
      prevActiveTool.onDeactivate();
      this._previousTool = prevActiveTool;
    }
    this._activeTool = tool;
    this._activeTool.onActivate();
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
      for (const command of this._commands) {
        if (command.shortCutKey === key) {
          command.invoke();
          return;
        }
      }
    }
    this.activeTool?.onKey(event, down);
  }

  // ==================================================
  // INSTANCE METHODS: Add and remove listeners
  // ==================================================

  public addEventListeners(): void {
    // https://www.w3schools.com/jsref/obj_mouseevent.asp
    const domElement = this._domElement;
    domElement.addEventListener('keydown', this._onKeyDown);
    domElement.addEventListener('keyup', this._onKeyUp);
    domElement.addEventListener('wheel', this._onWheel);
    domElement.addEventListener('focus', this._onFocus);
    domElement.addEventListener('blur', this._onBlur);
    this._pointerEventsTarget.addEventListeners();
  }

  public removeEventListeners(): void {
    const domElement = this._domElement;
    domElement.removeEventListener('keydown', this._onKeyDown);
    domElement.addEventListener('contextmenu', this._onContextMenu);
    domElement.removeEventListener('keyup', this._onKeyUp);
    domElement.removeEventListener('wheel', this._onWheel);
    domElement.removeEventListener('focus', this._onFocus);
    domElement.removeEventListener('blur', this._onBlur);
    this._pointerEventsTarget.removeEventListeners();
    for (const commands of this._commands) {
      commands.removeEventListeners();
    }
  }

  // ==================================================
  // INSTANCE METHODS: Events
  // ==================================================

  private readonly _onKeyDown = (event: KeyboardEvent): void => {
    this.onKey(event, true);
    event.stopPropagation();
    event.preventDefault();
  };

  private readonly _onContextMenu = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
  };

  private readonly _onKeyUp = (event: KeyboardEvent): void => {
    this.onKey(event, false);
    event.stopPropagation();
    event.preventDefault();
  };

  private readonly _onWheel = async (event: WheelEvent): Promise<void> => {
    await this.activeTool?.onWheel(event);
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

/*!
 * Copyright 2024 Cognite AS
 */

import { type BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';

/**
 * Base class for all option like commands. Override createOptions to add options
 * or use add method to add them in.
 */

export abstract class BaseOptionCommand extends RenderTargetCommand {
  public readonly isOptionMenu;

  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  private _children: BaseCommand[] | undefined = undefined;

  public get children(): BaseCommand[] | undefined {
    if (this._children === undefined) {
      this._children = this.createChildren();
    }
    return this._children;
  }

  public get hasChildren(): boolean {
    return this._children !== undefined && this._children.length > 0;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(isOptionMenu: boolean = true) {
    super();
    this.isOptionMenu = isOptionMenu;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  protected override *getChildren(): Generator<BaseCommand> {
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      yield child;
    }
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  protected createChildren(): BaseCommand[] {
    return []; // Override this to add options or use the constructor and add them in
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get selectedChild(): BaseCommand | undefined {
    const children = this.children;
    if (children === undefined) {
      return undefined;
    }
    return children.find((child) => child.isChecked);
  }

  protected add(child: BaseCommand): void {
    const children = this.children;
    if (children === undefined) {
      return undefined;
    }
    children.push(child);
  }
}

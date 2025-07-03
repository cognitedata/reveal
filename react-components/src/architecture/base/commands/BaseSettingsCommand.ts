import { clear } from '../utilities/extensions/arrayUtils';
import { type BaseCommand } from './BaseCommand';
import { RenderTargetCommand } from './RenderTargetCommand';

export abstract class BaseSettingsCommand extends RenderTargetCommand {
  // ==================================================
  // INSTANCE FIELDS/PROPERTIES
  // ==================================================

  private readonly _children: BaseCommand[] = [];

  public get children(): BaseCommand[] {
    return this._children;
  }

  public get hasChildren(): boolean {
    return this._children.length > 0;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  protected override *getChildren(): Generator<BaseCommand> {
    for (const child of this._children) {
      yield child;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public add(command: BaseCommand): void {
    if (this._children.find((c) => c.equals(command)) !== undefined) {
      console.error('Duplicated command given: ' + command.name);
      return;
    }
    this._children.push(command);
  }

  public clear(): void {
    clear(this._children);
  }
}

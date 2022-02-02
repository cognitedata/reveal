import { BasePropertyFolder } from '../../Base/BasePropertyFolder';
import { GroupProperty } from '../../Concrete/Folder/GroupProperty';

export class ExpanderProperty extends BasePropertyFolder {
  //= =================================================
  // INSTANCE MEMBERS
  //= =================================================

  private _expanded = true;

  private _showToolbar = false;

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get expanded(): boolean {
    return this._expanded;
  }

  public set expanded(value: boolean) {
    this._expanded = value;
  }

  public get showToolbar(): boolean {
    return this._showToolbar;
  }

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(name: string, showToolbar = false) {
    super(name);
    this._showToolbar = showToolbar;
  }

  //= =================================================
  // OVERRIDES of BasePropertyFolder
  //= =================================================

  createGroup(name: string): BasePropertyFolder {
    const folder = new GroupProperty(name);
    this.addChild(folder);
    return folder;
  }

  createExpander(name: string): BasePropertyFolder {
    const folder = new ExpanderProperty(name);
    this.addChild(folder);
    return folder;
  }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  createExpanderWithToolbar(name: string): BasePropertyFolder {
    const folder = new ExpanderProperty(name, true);
    this.addChild(folder);
    return folder;
  }
}

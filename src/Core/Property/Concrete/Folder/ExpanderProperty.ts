import GroupProperty from "@/Core/Property/Concrete/Folder/GroupProperty";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";

const FractionDigitsDefault = 2;

export default class ExpanderProperty extends BasePropertyFolder
{
  //==================================================
  // INSTANCE MEMBERS
  //==================================================

  private _expanded: boolean = true;
  private _showToolbar: boolean = false;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get expanded(): boolean { return this._expanded; }
  public set expanded(value: boolean) { this._expanded = value; }
  public get showToolbar(): boolean { return this._showToolbar; }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(name: string, showToolbar: boolean = false) 
  { 
    super(name);
    this._showToolbar = showToolbar;
  }

  //==================================================
  // OVERRIDES of BasePropertyFolder
  //==================================================

  createGroup(name: string): BasePropertyFolder
  {
    const folder = new GroupProperty(name);
    this.addChild(folder);
    return folder;
  }

  createExpander(name: string): BasePropertyFolder
  {
    const folder = new ExpanderProperty(name);
    this.addChild(folder);
    return folder;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  createExpanderWithToolbar(name: string,): BasePropertyFolder
  {
    const folder = new ExpanderProperty(name, true);
    this.addChild(folder);
    return folder;
  }
}

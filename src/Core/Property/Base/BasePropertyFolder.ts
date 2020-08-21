import BaseProperty from "./BaseProperty";

const FractionDigitsDefault = 2;

export default abstract class BasePropertyFolder extends BaseProperty
{
  //==================================================
  // INSTANCE MEMBERS
  //==================================================

  private _children: BaseProperty[] = [];

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get children(): BaseProperty[] { return this._children; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor(name: string) { super(name, false); }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getChildByName(name: string): BaseProperty | null
  {
    for (const child of this.children)
      if (child.name === name)
        return child;
    return null;
  }

  public getDescendantByName(name: string): BaseProperty | null
  {
    for (const child of this.children)
    {
      if (child.name === name)
        return child;

      if (child instanceof BasePropertyFolder)
      {
        const descendant = child.getDescendantByName(name);
        if (descendant != null)
          return descendant;
      }
    }
    return null;
  }

  public addChild(property: BaseProperty): void
  {
    this._children.push(property);
  }
}

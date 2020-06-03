
export abstract class BaseCommand
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { }

  //==================================================
  // VIRTUAL PROPERTIES
  //==================================================

  public /*virtual*/ get icon(): string { return ""; } // Icon
  public /*virtual*/ get name(): string { return ""; }; // Get the name of the command
  public /*virtual*/ get displayName(): string { return this.name; } // Get the name of the command
  public /*virtual*/ get tooltip(): string { return this.name; }  // Get the tooltip text
  public /*virtual*/ get shortCutKeys(): string | undefined { return undefined }; // Somehow gets the shortcut key (default none)

  public /*virtual*/ get isEnabled(): boolean { return true; } // Is enabled? (default true)
  public /*virtual*/ get isChecked(): boolean { return false; } // Is checked?
  public /*virtual*/ get isCheckable(): boolean { return false; } // Can be checked? (default false)
  public /*virtual*/ get isVisible(): boolean { return this.isEnabled; } // Is visible? 

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  protected abstract invokeCore(): boolean; // Returns true if executed ok

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public invoke(): boolean
  {
    return this.invokeCore();
  }
}

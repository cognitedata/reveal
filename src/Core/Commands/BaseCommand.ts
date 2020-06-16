
export abstract class BaseCommand
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { }

  //==================================================
  // VIRTUAL PROPERTIES
  //==================================================

  public /*virtual*/ getIcon(): string { return ""; } // Icon
  public /*virtual*/ getName(): string { return ""; }; // Get the name of the command
  public /*virtual*/ getDisplayName(): string { return this.getName(); } // Get the name of the command
  public /*virtual*/ getTooltip(): string { return this.getName(); }  // Get the tooltip text
  public /*virtual*/ getShortCutKeys(): string | undefined { return undefined }; // Somehow gets the shortcut key (default none)

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
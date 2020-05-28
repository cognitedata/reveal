
export abstract class BaseCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { }

  //==================================================
  // VIRTUAL PROPERTIES
  //==================================================

  public abstract get name(): string; // Get the name of the command
  public /*virtual*/ get displayName(): string { return this.name; } // Get the name of the command
  public /*virtual*/ get tooltip(): string { return this.name; }  // Get the tooltip text
  public /*virtual*/ get shortCutKeys(): string | undefined { return undefined }; // Somehow gets the shortcut key (default none)

  public /*virtual*/ get isEnabled() { return true; } // Is enabled? (default true)
  public /*virtual*/ get isChecked() { return false; } // Is checked?
  public /*virtual*/ get isCheckable() { return false; } // Can be checked? (default false)
  public /*virtual*/ get isVisible() { return this.isEnabled; } // Is visible? 

  // THESE TO MUST BE FILLED OUT 
  // protected abstract get Image(): Image  // Get the image

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  protected abstract invokeCore(): boolean; // Returns true if executed ok

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public invoke(): boolean {
    return this.invokeCore();
  }
}

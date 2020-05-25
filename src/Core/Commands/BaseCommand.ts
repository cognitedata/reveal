
export abstract class BaseCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { }

  //==================================================
  // VIRTUAL PROPERTIES
  //==================================================

  protected abstract get name(): string; // Get the name of the command
  protected /*virtual*/ get displayName(): string { return this.name; } // Get the name of the command
  protected /*virtual*/ get tooltip(): string { return this.name; }  // Get the tooltip text

  protected /*virtual*/ get isEnabled() { return true; } // Is enabled? (default true)
  protected /*virtual*/ get isChecked() { return false; } // Is checked?
  protected /*virtual*/ get isCheckable() { return false; } // Can be checked? (default false)

  protected /*virtual*/ get isVisible() { return this.isEnabled; } // Is visible? 

  // THESE TO MUST BE FILLED OUT 
  // protected abstract get ImageCore(): Image  // Get the image
  //protected abstract get  shortCutKeysCore() { return null} ; // Somehow gets the shortcut key (default none)

  //==================================================
  // VIRTUAL PROPERTIES
  //==================================================

  protected abstract invokeCore(): boolean; // Returns true if executed ok
}

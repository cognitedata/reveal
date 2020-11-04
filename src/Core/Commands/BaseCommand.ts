import { Util } from "@/Core/Primitives/Util";

export abstract class BaseCommand {
  //= =================================================
  // VIRTUAL PROPERTIES
  //= =================================================

  protected /* virtual */ getTooltipCore(): string { return ""; } // Get the tooltip text

  public /* virtual */ getIcon(): string { return ""; } // Icon

  public /* virtual */ getName(): string { return ""; }; // Get the name of the command

  public /* virtual */ getDisplayName(): string { return this.getName(); } // Get the name of the command

  public /* virtual */ getShortCutKeys(): string | undefined { return undefined; }; // Somehow gets the shortcut key (default none)

  public /* virtual */ isEnabled(): boolean { return true; } // Is enabled? (default true)

  public /* virtual */ get isChecked(): boolean { return false; } // Is checked?

  public /* virtual */ get isCheckable(): boolean { return false; } // Can be checked? (default false)

  public /* virtual */ get isVisible(): boolean { return this.isEnabled(); } // Is visible?

  public /* virtual */ get isDropdown(): boolean { return false; } // Is a Dropdown ?

  public /* virtual */ get dropdownOptions(): string[] { return [""]; };

  public /* virtual */ get value(): string { return ""; };

  //= =================================================
  // VIRTUAL METHODS
  //= =================================================

  protected /* virtual */ invokeCore(): boolean { return false; }

  protected /* virtual */ invokeValueCore(_: string): boolean { return false; }

  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  public getTooltip(): string {
    let tooltip = this.getTooltipCore();
    if (Util.isEmpty(tooltip))
      tooltip = this.getName();
    if (Util.isEmpty(tooltip))
      return tooltip;

    const shortCut = this.getShortCutKeys();
    if (shortCut && !Util.isEmpty(shortCut))
      tooltip += ` [${shortCut}]`;
    return tooltip;
  }

  public invoke(): boolean {
    return this.invokeCore();
  }

  public invokeValue(value: string): boolean {
    return this.invokeValueCore(value);
  }
}

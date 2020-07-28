// Toolbar command interface
import {BaseCommand} from "@/Core/Commands/BaseCommand";

export interface ToolbarCommand {
  isChecked: boolean;
  icon: string;
  command: BaseCommand;
  isVisible: boolean;
  isDropdown : boolean;
}
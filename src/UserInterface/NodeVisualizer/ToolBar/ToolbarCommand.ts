// Toolbar command interface
import { BaseCommand } from "@/Core/Commands/BaseCommand";

export interface IToolbarCommand
{
  isChecked: boolean;
  icon: string;
  command: BaseCommand;
  isVisible: boolean;
  isDropdown: boolean;
  value: string;
}

import { IToolbar } from "@/Core/Interfaces/IToolbar";
import { BaseCommand } from "@/Core/Commands/BaseCommand";
import { IToolbarGroups } from "@/Core/Interfaces/IToolbarGroups";

/**
 * Visualizer toolbar implementation
 */
export default class Toolbar implements IToolbar
{
  // Array to store toolbar commands
  private toolbarCommands: IToolbarGroups = {};

  // Getter for commands
  getCommands(): IToolbarGroups { return this.toolbarCommands; }

  //==================================================
  // OVERRIDES of IToolBar
  //==================================================

  /*override*/ add(groupId: string, command: BaseCommand): void
  {
    if (!this.toolbarCommands[groupId])
      this.toolbarCommands[groupId] = [];
    this.toolbarCommands[groupId].push(command);
  }
}

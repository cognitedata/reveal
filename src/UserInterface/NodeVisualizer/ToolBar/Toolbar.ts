import { IToolbar } from "@/Core/Interfaces/IToolbar";
import { BaseCommand } from "@/Core/Commands/BaseCommand";

/**
 * Visualizer toolbar implementation
 */
export default class Toolbar implements IToolbar
{
    // Array to store toolbar commands
    private commands: BaseCommand[] = [];

    // Getter for commands
    getCommands(): BaseCommand[] { return this.commands; }

    //==================================================
    // OVERRIDES of IToolBar
    //==================================================

    /*override*/ add(groupId: string, command: BaseCommand): void { this.commands.push(command); }
}

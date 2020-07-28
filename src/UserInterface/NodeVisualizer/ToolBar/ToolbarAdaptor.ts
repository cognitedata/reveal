import { BaseCommand } from "@/Core/Commands/BaseCommand";
import {ToolbarCommand} from "@/UserInterface/NodeVisualizer/ToolBar/ToolbarCommand";

/**
 * Adapter class to convert commands to Redux compatible state
 */
export default class ToolbarAdaptor {

    // Convert to Redux state
    static convert(commands: BaseCommand[]) {
        const output: ToolbarCommand[] = [];
        commands.forEach(command => {
            output.push({
                command,
                icon: command.getIcon(),
                isChecked: command.isChecked,
                isVisible: command.isVisible,
                isDropdown : command.isDropdown
            });
        });
        return output;
    }
}

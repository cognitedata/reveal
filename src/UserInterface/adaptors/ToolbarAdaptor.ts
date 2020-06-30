import { BaseCommand } from "@/Core/Commands/BaseCommand";
import { ToolbarCommand } from "../interfaces/visualizers";

/**
 * Adapter class to convert commands to redux compatible state
 */
export default class ToolbarAdaptor {

    // Convert to redux state
    static convert(commands: BaseCommand[]) {
        const output: ToolbarCommand[] = [];
        commands.forEach(command => {
            output.push({
                command,
                icon: command.getIcon(),
                isChecked: command.isChecked
            });
        });
        return output;
    }
}

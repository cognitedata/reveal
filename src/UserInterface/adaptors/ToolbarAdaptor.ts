/**
 * Adapter class to convert commands to redux compatible state
 */
export default class ToolbarAdaptor {

    // Convert to redux state
    static convert(commands: any[]): any[] {
        const output: any[] = [];
        commands.forEach(command => {
            output.push({
                command,
                icon: command.getIcon(),
                isChecked: command.isChecked
            });
        })
        return output;
    }
}

/**
 * Adapter class to convert commands to redux compatible state
 */
export default class ToolbarAdaptor {

    // Convert to redux state
    static convert(commands: any[]): { [key: string]: any[] } {
        const output: { [key: string]: any[] } = {};
        commands.map(command => {
            const commandType = command.constructor.name;
            if (!output[commandType]) {
                output[commandType] = [];
            }
            output[commandType].push({
                command,
                icon: command.icon,
                isChecked: command.isChecked
            });
        });
        return output;
    }
}

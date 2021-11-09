import * as listCmd from './solutions/list';
import * as createCmd from './solutions/create';
import * as deleteCmd from './solutions/delete';

export const command = 'solutions <command>';
export const desc = 'Manage solutions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function builder(yargs: any) {
  return yargs
    .command(listCmd.command, true, listCmd.builder, listCmd.handler)
    .command(createCmd.command, true, createCmd.builder, createCmd.handler)
    .command(deleteCmd.command, true, deleteCmd.builder, deleteCmd.handler);
}
// eslint-disable-next-line
export function handler() {}

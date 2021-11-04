import * as listCmd from './solutions/list';

export const command = 'solutions <command>';
export const desc = 'Manage solutions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function builder(yargs: any) {
  return yargs.command(listCmd.command, true, listCmd.builder, listCmd.handler);
}
// eslint-disable-next-line
export function handler() {}

import { Arguments } from 'yargs';

export const getCommandName = (arg: Arguments<unknown>) => arg._[0];

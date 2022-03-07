import { Arguments } from 'yargs';

export const getCommandName = (arg: Arguments) => arg._[0];

export const getCompleteCommandString = (arg: Arguments) => arg._.join(' ');

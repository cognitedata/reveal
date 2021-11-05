import { Arguments } from 'yargs';
import Conf from 'conf';
import { BaseArgs } from '../types';
import { setConfig } from '../utils/config';

export async function init(args: Arguments<BaseArgs>) {
  setConfig(new Conf({ projectName: args.appId }));
}

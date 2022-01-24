import { scriptName } from 'yargs';
import { detailed } from 'yargs-parser';
import { environment } from '../environments/environment';

import { cliConfig } from './cli-config';

export function getArgs() {
  let cliArgs = scriptName('cdf-mock-server')
    .config(cliConfig)
    .usage('$0 [options] <source>')
    .options({
      config: {
        alias: 'c',
        description: 'Mock server config, url rewrites...etc.',
        default: '',
      },
      port: {
        alias: 'p',
        description: 'Set port',
        default: 3000,
      },
      middlewares: {
        alias: 'm',
        array: true,
        description: 'Inject custom middlewares',
        default: [],
      },
    })
    .help('help')
    .alias('help', 'h')
    .example('$0 db.json', '')
    .example('$0 file.js', '')
    .example('$0 http://example.com/db.json', '')
    .epilog('ttps://github.com/cognitedata/platypus/apps/mock-server')
    .parse();

  // Should be used only for development purposes only!
  // Read the readme file how you can pass args
  const processArgs = process.argv.slice(2);
  if (
    !environment.production &&
    processArgs.length &&
    processArgs[0].toString().match(/--[a-zA-Z-]{1,}=/g)
  ) {
    const parsedArgs = detailed(processArgs[0].toString()).argv;
    cliArgs = Object.assign(cliArgs, parsedArgs);
  }
  return cliArgs;
}

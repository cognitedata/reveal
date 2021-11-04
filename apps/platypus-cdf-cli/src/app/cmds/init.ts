import { Argv } from 'yargs';

export const command = 'init [name] [dir]';
export const desc = 'Create a new Platypus project';
export const builder = (yargs: Argv) => {
  yargs
    .usage('$0 init [name] [dir]')
    .example('', 'platypus init MyProject')
    .example(
      '',
      'platypus init --project-id ab05f0ecb-4106-46ea-984b-b998efc6171c'
    )
    .conflicts('project-id', ['name', 'schema'])
    .positional('name', {
      description: 'Name of the Platypus project',
      type: 'string',
    })
    .positional('dir', {
      description: 'Directory to setup .itgrc config file',
      default: '.',
    })
    .option('schema', {
      description: 'Path to the schema file',
      alias: 's',
    });
};

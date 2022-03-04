import { spawn } from 'child_process';
import concat from 'concat-stream';

/**
 *
 * @param arg string[] - arguments to pass to the command e.g. ['cdf', 'templates', 'generate', '--plugins', 'typescript'], dont specify (yarn/npm)
 */
export const Run = async (...arg: string[]): Promise<string> => {
  const createProcess = (args: string[]) => {
    return spawn('yarn', args);
  };
  const childProcess = createProcess(arg);
  childProcess.stdin.setDefaultEncoding('utf8');

  return new Promise((resolve, reject) => {
    childProcess.stderr.once('data', (data) => {
      reject(data.toString());
    });

    childProcess.on('error', reject);

    childProcess.on('exit', (code) => {
      if (code !== 0) {
        reject(`Exit code: ${code}`);
      }
    });

    childProcess.stdout.pipe(
      concat((data) => {
        resolve(data.toString());
      })
    );
  });
};

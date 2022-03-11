import { spawn } from 'child_process';

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
    let dataOut = '';
    let dataErr = '';
    childProcess.stderr.once('data', (data) => {
      dataErr += data;
    });

    childProcess.on('error', reject);

    childProcess.on('exit', (code) => {
      if (code !== 0) {
        reject(
          `Exit code: ${code}\nError output:\n${dataErr}\nStandard output:\n${dataOut}`
        );
      } else {
        resolve(dataOut);
      }
    });

    childProcess.stdout.on('data', (d) => {
      dataOut += d;
    });
  });
};

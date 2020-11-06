import { Selector, t as importedT } from 'testcafe';

export const find = (attr) => Selector(`[data-test-id="${attr}"]`);

export const log = (
  msg: string,
  indent: boolean = false,
  extras: any[] = []
): void => {
  if (indent) {
    // eslint-disable-next-line no-console
    console.log(`\t\t${msg}`, extras);

    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\t${msg}`, extras);
};

interface Errors {
  log?: boolean;
  info?: boolean;
  warn?: boolean;
  error?: boolean;
}

// only log errors by default
export const logErrors = async (
  t = importedT,
  enabled: Errors = { error: false }
) => {
  const logArray = (arr: any[] = [], name: string = '') => {
    if (arr.length > 0) {
      // eslint-disable-next-line no-console
      log(name, false, arr);
    }
  };

  const { error, info, warn, log: logs } = await t.getBrowserConsoleMessages();

  enabled.log && logArray(logs, 'log');
  enabled.info && logArray(info, 'info');
  enabled.warn && logArray(warn, 'warn');
  enabled.error && logArray(error, 'error');

  // if (error) {
  //   await t.expect(error[0]).notOk();
  // }
};

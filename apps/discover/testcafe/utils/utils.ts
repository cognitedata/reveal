import { t, Selector } from 'testcafe';
import { v1 } from 'uuid';

export const find = (testid: string) => Selector(`[data-testid="${testid}"]`);

// Unique id that changes for each instance. Useful when creating unique
// entries that are used over multiple tests
export const testRunId = `CI_${v1()}`;

export const title = (msg: string) =>
  // eslint-disable-next-line no-console
  console.log(`Starting: ${msg}`);

export const progress = (msg: string, indent = false): void => {
  if (indent) {
    let updatedActionMessage = msg;
    if (msg.slice(0, 1) !== '[') {
      updatedActionMessage = `[] ${msg}`;
    }
    // eslint-disable-next-line no-console
    console.log(`\t\t${updatedActionMessage}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\t${msg}`);
};

interface Errors {
  log?: boolean;
  info?: boolean;
  warn?: boolean;
  error?: boolean;
}

// Note that this method returns only messages posted via the console.error, console.warn, console.log and console.info methods.
// Messages output by the browser (like when an unhandled exception occurs on the page) will not be returned.
export const logErrors = async (enabled: Errors = { error: true }) => {
  const logArray = (arr: any[] = [], name = '') => {
    if (arr.length > 0) {
      // eslint-disable-next-line no-console
      console.log(name, arr);
    }
  };

  // https://testcafe.io/documentation/402700/reference/test-api/testcontroller/getbrowserconsolemessages
  const { error, info, warn, log } = await t.getBrowserConsoleMessages();

  if (enabled.log) logArray(log, 'log');
  if (enabled.info) logArray(info, 'info');
  if (enabled.warn) logArray(warn, 'warn');
  if (enabled.error) logArray(error, 'error');
};

// DO NOT EXPORT THIS FUNCTION
const startTestInMode = (
  mode: jest.It | TestFn,
  testTitle: string,
  doTest: () => Promise<any>
) => {
  mode(`should ${testTitle}`, async () => {
    title(testTitle);
    await doTest();
  });
};

export const startTest = (testTitle: string, doTest: () => Promise<any>) => {
  startTestInMode(test, testTitle, doTest);
};
startTest.only = (testTitle: string, doTest: () => Promise<any>) => {
  startTestInMode(test.only, testTitle, doTest);
};
startTest.skip = (testTitle: string, doTest: () => Promise<any>) => {
  startTestInMode(test.skip, testTitle, doTest);
};

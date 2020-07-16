import { SentryPayload } from './reportException';
import * as actual from './index';

export default {
  ...actual,
  reportException: (error: Error, extras: SentryPayload) => {
    console.log(
      `Error to report: ${error} (${
        extras ? JSON.stringify(extras) : 'no extras'
      })`
    );
    return Promise.resolve({ error, errorId: 'fake-error-id' });
  },
};

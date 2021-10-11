/* eslint-disable no-console */
import { waitFor } from '@testing-library/react';

import { log } from '_helpers/log';

describe('Logs', () => {
  it('console log', async () => {
    console.log = jest.fn();
    log('test', 'data', 1);
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(console.log).toHaveBeenCalledWith('test'));
  });

  it('console warn', async () => {
    console.warn = jest.fn();
    log('test', 'data', 2);
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(console.warn).toHaveBeenCalledWith('test'));
  });

  it('console error', async () => {
    console.error = jest.fn();
    log('test', 'data');
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(console.error).toHaveBeenCalledWith('test'));
  });
});

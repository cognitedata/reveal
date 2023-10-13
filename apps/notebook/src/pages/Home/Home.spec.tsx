import React from 'react';

import { act, render, waitFor } from '@testing-library/react';

import { getToken } from '@cognite/cdf-sdk-singleton';

import Home from './Home';

jest.mock('@cognite/react-feature-flags', () => ({
  __esModule: true,
  useFlag: () => ({ isEnabled: true }),
}));
jest.mock('@cognite/cdf-sdk-singleton', () => ({
  __esModule: true,
  getUserInformation: () =>
    Promise.resolve({ displayName: 'test-user', email: '', mail: '' }),
  getToken: jest.fn().mockResolvedValue('some_token'),
  default: {
    getBaseUrl: jest.fn().mockResolvedValue('123'),
    project: 'test',
  },
}));

describe('Home', () => {
  beforeEach(() => {
    (getToken as jest.Mock).mockClear();
    (getToken as jest.Mock).mockResolvedValue('some_token');
  });
  it('Sends a token from timer', async () => {
    jest.useFakeTimers();
    const ref = React.createRef<HTMLIFrameElement | null>();
    await render(<Home recheckTokenInterval={1000} ref={ref} />);
    const postMessage = jest.spyOn(ref.current!.contentWindow!, 'postMessage');
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await expect(getToken as jest.Mock).toBeCalledTimes(1);
    });
    await waitFor(() => expect(postMessage).toBeCalledTimes(1));
  });
  it('Sends a token from a message', async () => {
    const ref = React.createRef<HTMLIFrameElement | null>();
    // make the interval longer
    await render(<Home recheckTokenInterval={100000} ref={ref} />);
    const postMessage = jest.spyOn(ref.current!.contentWindow!, 'postMessage');
    await act(async () => {
      window.postMessage('getToken', '*');
    });
    await waitFor(() => expect(getToken as jest.Mock).toBeCalledTimes(1));
    await waitFor(() => expect(postMessage).toBeCalledTimes(1));
  });
  it('Sends a refresh token token from timer no matter if token changes', async () => {
    jest.useFakeTimers();
    const ref = React.createRef<HTMLIFrameElement | null>();
    await render(<Home recheckTokenInterval={1000} ref={ref} />);
    const postMessage = jest.spyOn(ref.current!.contentWindow!, 'postMessage');
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await expect(getToken as jest.Mock).toBeCalledTimes(1);
    });
    (getToken as jest.Mock).mockResolvedValue('some_token_2');
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await expect(getToken as jest.Mock).toBeCalledTimes(2);
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await expect(getToken as jest.Mock).toBeCalledTimes(3);
    });
    await waitFor(() => expect(postMessage).toBeCalledTimes(3));
  });
});

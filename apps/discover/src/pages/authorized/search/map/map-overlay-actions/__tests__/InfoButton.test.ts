import { screen, waitFor } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { InfoButton, InfoCode } from '..';

describe('InfoButton', () => {
  const page = (viewProps?: any) =>
    testRenderer(InfoButton, undefined, viewProps);

  const defaultTestInit = async (props?: { infoCodes: InfoCode[] }) => {
    return {
      ...page({
        ...props,
      }),
    };
  };

  test('Display info message', async () => {
    await defaultTestInit({ infoCodes: ['cancel'] });

    const cancelMessage = await waitFor(() =>
      screen.findByTestId('cancel-info-message')
    );

    expect(cancelMessage).toBeInTheDocument();
  });

  test('Display multiple info messages with separatror', async () => {
    await defaultTestInit({
      infoCodes: ['finish', 'cancel'],
    });

    const cancelMessage = await waitFor(() =>
      screen.findByTestId('cancel-info-message')
    );

    const finishMessage = await waitFor(() =>
      screen.findByTestId('finish-info-message')
    );

    const separator = await waitFor(() =>
      screen.findByTestId('info-message-separator')
    );

    expect(cancelMessage).toBeInTheDocument();
    expect(finishMessage).toBeInTheDocument();
    expect(separator).toBeInTheDocument();
  });
});

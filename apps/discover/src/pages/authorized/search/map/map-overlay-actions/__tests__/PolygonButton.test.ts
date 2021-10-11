import { screen, waitFor, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { PolygonButton } from '..';

describe('PolygonButton', () => {
  const page = (viewProps?: any) =>
    testRenderer(PolygonButton, undefined, viewProps);

  const onToggle = jest.fn();

  const defaultTestInit = async (props?: { isActive: boolean }) => {
    return {
      ...page({
        onToggle,
        isActive: false,
        ...props,
      }),
    };
  };

  test('callback for toggle', async () => {
    await defaultTestInit();

    const togleButton = await waitFor(() =>
      screen.findByTestId('freedraw-button')
    );

    expect(togleButton).toBeInTheDocument();

    fireEvent.click(togleButton);

    expect(onToggle.mock.calls.length).toEqual(1);
  });

  test('button text on inactive mode', async () => {
    await defaultTestInit();

    const buttonText = await waitFor(() => screen.findByText('Polygon tool'));

    expect(buttonText).toBeInTheDocument();
  });

  test('button text on active mode', async () => {
    await defaultTestInit({ isActive: true });

    const buttonText = await waitFor(() =>
      screen.findByText('Cancel polygon search')
    );

    expect(buttonText).toBeInTheDocument();
  });
});

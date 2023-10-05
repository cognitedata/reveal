import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import render from '@transformations/utils/test/render';

import TransformationDetailsTopbarActionButtons from './TransformationDetailsTopbarActionButtons';

const mockTransformation: any = {};

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    getFlow: jest.fn(() => 'AZURE_AD'),
  };
});

jest.mock('@transformations/hooks/sessions', () => {
  return {
    ...jest.requireActual('@transformations/hooks/sessions'),
    useTokenExchangeSupport: jest.fn(() => {
      return {
        data: {
          supported: true,
        },
      };
    }),
  };
});

describe('TransformationDetailsTopbarActionButtons', () => {
  it('should show the "Run as current user" button if able to run as current user', async () => {
    render(
      <TransformationDetailsTopbarActionButtons
        isLoading={false}
        transformation={mockTransformation}
      />
    );

    // We first find the menu action button to show us options for running the transformation
    const runBtn = await screen.findByText('Run');

    // We need to open the menu to see the "Run as current user" button
    userEvent.click(runBtn);

    expect(await screen.findByText('Run as current user')).toBeInTheDocument();
  });

  it('should show the "Run with client credentials" button', async () => {
    render(
      <TransformationDetailsTopbarActionButtons
        isLoading={false}
        transformation={mockTransformation}
      />
    );

    const runBtn = await screen.findByText('Run');

    userEvent.click(runBtn);

    expect(
      await screen.findByText('Run with client credentials')
    ).toBeInTheDocument();
  });
});

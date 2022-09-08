import { fireEvent, waitFor, screen } from '@testing-library/react';
import { testRenderer } from 'utils/test';

import { CopyButton } from './CopyButton';

describe('Copy button tests', () => {
  const testFunction = jest.fn(() => Promise.resolve(true));

  it('Should call the copyFunction passed to it', async () => {
    testRenderer(<CopyButton copyFunction={testFunction} />);

    const copyButton = await screen.findByRole('button');
    fireEvent.click(copyButton);

    await waitFor(() => expect(testFunction).toHaveBeenCalled());
  });

  it('Should display correct tooltip when hovering on copy button', async () => {
    testRenderer(<CopyButton copyFunction={testFunction} />);

    const copyButton = await screen.findByRole('button');
    fireEvent.mouseEnter(copyButton);

    const tooltip = await screen.findByRole('tooltip');
    await waitFor(() => expect(tooltip).toHaveTextContent('Copy to clipboard'));

    fireEvent.click(copyButton);
    await waitFor(() => expect(tooltip).toHaveTextContent('Copied!'));
  });

  it('Should contain correct className if given', async () => {
    testRenderer(
      <CopyButton copyFunction={testFunction} className="test-class-name" />
    );

    const copyButton = await screen.findByRole('button');
    await waitFor(() => expect(copyButton).toHaveClass('test-class-name'));
  });
});

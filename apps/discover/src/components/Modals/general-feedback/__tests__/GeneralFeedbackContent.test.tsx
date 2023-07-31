import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { GeneralFeedbackContent, Props } from '../GeneralFeedbackContent';

describe('GeneralFeedbackContent Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(GeneralFeedbackContent, undefined, viewProps);
  it('should render textarea', async () => {
    const handleTextChange = jest.fn();
    await testInit({
      handleTextChange,
    });
    expect(screen.getByTestId('general-feedback-input')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Feedback'), {
      target: { value: 'NEW FEEDBACK' },
    });
    expect(screen.getByText('NEW FEEDBACK')).toBeInTheDocument();
  });
});

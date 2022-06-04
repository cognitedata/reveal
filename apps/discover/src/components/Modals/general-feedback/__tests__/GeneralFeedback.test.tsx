import { useFeedbackCreateMutate } from 'domain/feedback/internal/actions/useFeedbackCreateMutate';

import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { GeneralFeedbackModal, Props } from '../GeneralFeedback';

jest.mock('domain/feedback/internal/actions/useFeedbackCreateMutate', () => ({
  useFeedbackCreateMutate: jest.fn(),
}));

describe('GeneralFeedbackContent Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRendererModal(GeneralFeedbackModal, undefined, viewProps);
  it('should render textarea', async () => {
    (useFeedbackCreateMutate as jest.Mock).mockImplementation(() => ({
      mutateAsync: jest.fn(),
    }));
    const onCancel = jest.fn();
    await testInit({
      onCancel,
      visible: true,
    });
    expect(screen.getByTestId('general-feedback-input')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Feedback'), {
      target: { value: 'NEW FEEDBACK' },
    });
    expect(screen.getByText('NEW FEEDBACK')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Send'));
  });
});

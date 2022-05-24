import { fireEvent, screen } from '@testing-library/react';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { FEEDBACK_CONFIRM_TOAST } from 'constants/feedback';
import { useDocument } from 'hooks/useDocument';

import { EntityFeedbackModal } from '../EntityFeedbackModal';

jest.mock('hooks/useDocument', () => ({
  useDocument: jest.fn(),
}));

describe('EntityFeedbackModal Tests', () => {
  beforeEach(() => {
    const mockDocument = getMockDocument();
    (useDocument as jest.Mock).mockImplementation(() => [
      mockDocument,
      false,
      undefined,
    ]);
  });

  const store = getMockedStore();

  const testInit = async (viewProps?: { open: boolean }) =>
    testRendererModal(EntityFeedbackModal, store, viewProps);

  it('should render modal content as expected', async () => {
    await testInit({
      open: true,
    });
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('fill the form and submit', async () => {
    const { getByCheckbox } = await testInit({
      open: true,
    });

    const sensitiveData = screen.getByTestId('sensitive-data-checkbox');
    const sensitiveDataCheckbox = getByCheckbox(sensitiveData);
    expect(sensitiveDataCheckbox).toBeTruthy();
    if (sensitiveDataCheckbox) {
      fireEvent.click(sensitiveDataCheckbox);
    }

    const incorrectGeo = screen.getByTestId('incorrect-geo-checkbox');
    const incorrectGeoCheckbox = getByCheckbox(incorrectGeo);
    expect(incorrectGeoCheckbox).toBeTruthy();
    if (incorrectGeoCheckbox) {
      fireEvent.click(incorrectGeoCheckbox);
    }
    const feedbackOther = screen.getByTestId('feedback-other-checkbox');
    const feedbackOtherCheckbox = getByCheckbox(feedbackOther);
    expect(feedbackOtherCheckbox).toBeTruthy();
    if (feedbackOtherCheckbox) {
      fireEvent.click(feedbackOtherCheckbox);
    }
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    expect(await screen.findByText(FEEDBACK_CONFIRM_TOAST)).toBeInTheDocument();
  });
});

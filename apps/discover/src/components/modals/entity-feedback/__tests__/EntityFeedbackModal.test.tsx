import { useSelector } from 'react-redux';

import { fireEvent, screen } from '@testing-library/react';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRendererModal } from '__test-utils/renderer';
import { FEEDBACK_CONFIRM_TOAST } from 'constants/feedback';
import { useDocument } from 'hooks/useDocument';
import { useQueryDocumentLabels } from 'modules/api/documents/useDocumentQuery';

import { EntityFeedbackModal } from '../EntityFeedbackModal';

const appState = {
  feedback: {
    objectFeedbackModalDocumentId: 200,
  },
};

const mockClearObjectFeedbackModalDocumentId = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockClearObjectFeedbackModalDocumentId,
}));
jest.mock('modules/api/documents/useDocumentQuery', () => ({
  useQueryDocumentLabels: jest.fn(),
}));
jest.mock('hooks/useDocument', () => ({
  useDocument: jest.fn(),
}));

describe('EntityFeedbackModal Tests', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) =>
      callback(appState)
    );
    (useQueryDocumentLabels as jest.Mock).mockImplementation(() => ({
      data: [{ name: 'name', count: 1, id: 'id' }],
    }));
    const mockDocument = getMockDocument();
    (useDocument as jest.Mock).mockImplementation(() => [
      mockDocument,
      false,
      undefined,
    ]);
  });
  afterEach(() => {
    (useSelector as jest.Mock).mockClear();
    (useQueryDocumentLabels as jest.Mock).mockClear();
    (useDocument as jest.Mock).mockClear();
  });
  const testInit = async (viewProps?: any) =>
    testRendererModal(EntityFeedbackModal, undefined, viewProps);
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

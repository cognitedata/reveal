import '__mocks/mockContainerAuth'; // should be first
import '__mocks/mockCogniteSDK';
import { getMockDocumentCategoriesResult } from 'domain/documents/service/__mocks/getMockDocumentCategoriesGet';

import { fireEvent, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';
import { getMockFeedbackObjectPost } from 'services/feedback/__mocks/getMockFeedbackObjectPost';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { FEEDBACK_CONFIRM_TOAST } from 'constants/feedback';

import { EntityFeedbackModal } from '../EntityFeedbackModal';

const mockServer = setupServer(
  getMockDocumentSearch(),
  getMockFeedbackObjectPost(),
  getMockConfigGet(),
  getMockDocumentCategoriesResult()
);

describe('EntityFeedbackModal Tests', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

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

import '__mocks/mockContainerAuth'; // should be first
import '__mocks/mockCogniteSDK';
import { getMockDocumentCategoriesResult } from 'domain/documents/service/__mocks/getMockDocumentCategoriesGet';
import { getMockDocumentSearch } from 'domain/documents/service/__mocks/getMockDocumentSearch';
import { getMockFeedbackObjectPost } from 'domain/feedback/service/__mocks/getMockFeedbackObjectPost';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';

import { fireEvent, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  INCORRECT_GEO_CHECKBOX_LABEL,
  OTHER_CHECKBOX_LABEL,
  SENSITIVE_DATA_CHECKBOX_LABEL,
} from 'components/Modals/constants';
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
    await testInit({
      open: true,
    });

    const sensitiveDataCheckbox = screen.getByLabelText(
      SENSITIVE_DATA_CHECKBOX_LABEL
    );
    expect(sensitiveDataCheckbox).toBeInTheDocument();
    if (sensitiveDataCheckbox) {
      fireEvent.click(sensitiveDataCheckbox);
    }
    const incorrectGeoCheckbox = screen.getByLabelText(
      INCORRECT_GEO_CHECKBOX_LABEL
    );
    expect(incorrectGeoCheckbox).toBeInTheDocument();
    if (incorrectGeoCheckbox) {
      fireEvent.click(incorrectGeoCheckbox);
    }
    const feedbackOtherCheckbox = screen.getByLabelText(OTHER_CHECKBOX_LABEL);
    expect(feedbackOtherCheckbox).toBeInTheDocument();
    if (feedbackOtherCheckbox) {
      fireEvent.click(feedbackOtherCheckbox);
    }
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    expect(await screen.findByText(FEEDBACK_CONFIRM_TOAST)).toBeInTheDocument();
  });
});

import '__mocks/mockContainerAuth'; // never miss this import
import { useFeedbackDocumentStatus } from 'domain/documents/internal/hooks/useFeedbackDocumentStatus';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { getMockDocumentFeedbackDetails } from '__test-utils/fixtures/documentFeedback';
import { testWrapper } from '__test-utils/renderer';

import { getMockListDocumentFeedback } from '../../__mocks/mockDocumentFeedbacks';

const mockServer = setupServer(
  getMockListDocumentFeedback(getMockDocumentFeedbackDetails())
);

describe('Document feedback hooks', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    mockServer.listen();
  });

  afterAll(() => mockServer.close());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const initiateTest = (
    documentId: number,
    label: string,
    feedbackCreatedDate: string
  ) => {
    return renderHook(
      () => useFeedbackDocumentStatus(documentId, label, feedbackCreatedDate),
      {
        wrapper: testWrapper,
      }
    );
  };

  it('Should get the assessment of document with multiple assessments with "earliest" match to feedback creation', async () => {
    const { result, waitForNextUpdate } = initiateTest(
      100,
      'testId1',
      '2021-02-03T16:24:23.284407'
    );

    await waitForNextUpdate();

    const content = result.current;

    expect(content).toMatchObject({
      assessed: true,
      loading: false,
      status: 'ACCEPTED',
    });
  });

  it('Should get the assessment of document with multiple assessments with "latest" match to feedback creation', async () => {
    const { result, waitForNextUpdate } = initiateTest(
      100,
      'testId1',
      '2021-02-06T16:24:23.284407'
    );

    await waitForNextUpdate();

    const content = result.current;

    expect(content).toMatchObject({
      assessed: true,
      loading: false,
      status: 'REJECTED',
    });
  });

  it('Should be returning default values when document id is not found in document feedback', async () => {
    const { waitForNextUpdate } = initiateTest(981, 'testId1', '2021-02-07');

    await waitForNextUpdate();

    return {
      loading: false,
      assessed: false,
      status: undefined,
    };
  });
});

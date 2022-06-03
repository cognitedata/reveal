import '__mocks/mockContainerAuth'; // never miss this import
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { getMockDocumentFeedbackDetails } from '__test-utils/fixtures/documentFeedback';
import { testWrapper } from '__test-utils/renderer';

import { getMockListDocumentFeedback } from '../__mocks/mockDocumentFeedbacks';
import { useFeedbackDocumentStatus } from '../hooks';

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

  const initiateTest = (documentId: number, label: string) => {
    return renderHook(() => useFeedbackDocumentStatus(documentId, label), {
      wrapper: testWrapper,
    });
  };

  it('should return expected result with input', async () => {
    const { result } = initiateTest(2, 'falseLabel');

    const content = await result.current;
    expect(content).toMatchObject({
      assessed: false,
      loading: true,
      status: undefined,
    });
  });

  it('should return expected result with inputs', async () => {
    const { result, waitForNextUpdate } = initiateTest(100, 'testId1');

    await waitForNextUpdate();

    const content = await result.current;

    expect(content).toMatchObject({
      assessed: true,
      loading: false,
      status: 'ACCEPTED',
    });
  });
});

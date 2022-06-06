import '__mocks/mockContainerAuth'; // never miss this import
import { act } from 'react-test-renderer';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import {
  getAcceptMockFeedback,
  getMockDocumentFeedbackDetails,
  getRejectMockFeedback,
} from '__test-utils/fixtures/documentFeedback';
import { testWrapper } from '__test-utils/renderer';

// eslint-disable-next-line
import {
  acceptMockDocumentFeedback,
  postMockDocumentFeedback,
  rejectMockDocumentFeedback,
} from '../../__mocks/mockDocumentFeedbacks';
import { useDocumentFeedbackMutate } from '../useDocumentFeedbackMutate';

const mockServer = setupServer(
  postMockDocumentFeedback(getMockDocumentFeedbackDetails()),
  acceptMockDocumentFeedback(getAcceptMockFeedback()),
  rejectMockDocumentFeedback(getRejectMockFeedback())
);

describe('Document Feedback Mutate', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const initiateTest = async () => {
    const { result } = renderHook(() => useDocumentFeedbackMutate(), {
      wrapper: testWrapper,
    });

    return result.current;
  };

  it('should return accept document feedback results', async () => {
    const { mutateAsync } = await initiateTest();

    await act(() =>
      mutateAsync({
        type: 'accept',
        documentId: Number(123),
        label: { externalId: '123' },
        action: 'ATTACH',
        reporterInfo: 'test',
      }).then((result) => {
        expect(result).toMatchObject(getAcceptMockFeedback());
      })
    );
  });

  it('should return reject document feedback results', async () => {
    const { mutateAsync } = await initiateTest();

    await act(() =>
      mutateAsync({
        type: 'reject',
        documentId: Number(123),
        label: { externalId: '123' },
        action: 'ATTACH',
        reporterInfo: 'test',
      }).then((result) => {
        expect(result).toMatchObject(getRejectMockFeedback());
      })
    );
  });
});

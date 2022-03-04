import { fireEvent, screen } from '@testing-library/react';
import { Store } from 'redux';
import { getMockedDocumentFeedbackItem } from 'services/feedback/__fixtures/feedback';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { DocumentFeedbackTable } from '../DocumentFeedbackTable';

const mockDocumentFeedbackItemOne = getMockedDocumentFeedbackItem({
  id: '111111',
  deleted: false,
  isSensitiveByAdmin: true,
  createdTime: '2010-01-05',
  status: 1,
});

const mockDocumentFeedbackItemTwo = getMockedDocumentFeedbackItem({
  id: '222222',
  deleted: false,
  isSensitiveByAdmin: true,
  createdTime: '2010-10-05',
  status: 0,
  comment: '',
  user: {
    id: '1',
    email: 'john.doe@cognite.com',
    firstname: 'John',
    lastname: 'Doe',
  },
  assignee: {
    id: '2',
    email: 'jane.doe@cognite.com',
    firstname: 'Jane',
    lastname: 'Doe',
  },
});

const mockDocumentFeedbackItemThree = getMockedDocumentFeedbackItem({
  id: '333333',
  deleted: false,
  isSensitiveData: true,
  createdTime: '2010-10-05',
  status: 0,
  comment: 'DOCUMENT_THREE',
  user: {
    id: '3',
    email: 'richard.doe@cognite.com',
    firstname: 'Richard',
    lastname: 'Doe',
  },
  assignee: {
    id: '4',
    email: 'kane.doe@cognite.com',
    firstname: 'Kane',
    lastname: 'Doe',
  },
});

const DocumentFeedbackTableComponent = () => {
  const setCommentTarget = jest.fn();
  return (
    <DocumentFeedbackTable
      setCommentTarget={setCommentTarget}
      documentFeedbackItems={[
        mockDocumentFeedbackItemOne,
        mockDocumentFeedbackItemTwo,
        mockDocumentFeedbackItemThree,
      ]}
    />
  );
};

describe('DocumentFeedbackTable Tests', () => {
  const setupStore = () => {
    const store = getMockedStore({
      feedback: {
        objectFeedbackShowDeleted: false,
      },
    });
    return store;
  };

  const testInit = async (store: Store, viewProps?: any) =>
    testRendererModal(DocumentFeedbackTableComponent, store, viewProps);

  it('should render table with user name', async () => {
    await testInit(setupStore());
    expect(screen.getByText('Richard Doe')).toBeInTheDocument(); // in user column
  });

  it('should render table with records', async () => {
    await testInit(setupStore());
    expect(screen.getByText('comment')).toBeInTheDocument();
    fireEvent.click(screen.getByText('comment'));
  });

  it('should render record with archive button', async () => {
    await testInit(setupStore());
    expect(screen.getByText('comment')).toBeInTheDocument();

    const archiveButton = screen.getByTestId('button-archive-333333');
    expect(archiveButton).toBeInTheDocument();
    fireEvent.click(archiveButton);

    screen.getByText('Assess sensitivity');
    fireEvent.click(screen.getByText('OK'));
  });
});

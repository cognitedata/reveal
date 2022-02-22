// mock file upload implementation
import { processReducerInitialState } from 'src/modules/Process/store/slice';
import React from 'react';
import { getRealStore } from 'src/__test-utils/store.utils';
import { testRenderer } from 'src/__test-utils/renderer';
import { ProcessState } from 'src/modules/Process/store/types';
import { fireEvent, waitFor } from '@testing-library/react';
import { ProcessFileUploadModalContainer } from 'src/modules/Process/Containers/ProcessFileUploadModalContainer';

jest.mock('src/modules/Common/Components/FileUploaderModal/FileUploaderModal');

describe('Test ProcessFileUploadModalContainer.spec.tsx', () => {
  const TestComponent = (props: any) => {
    return <ProcessFileUploadModalContainer {...props} />;
  };

  it('on finish upload file ids needs to be available in process slice', async () => {
    const mockProcessState: ProcessState = {
      ...processReducerInitialState,
      showFileUploadModal: true,
    };

    const realStore = getRealStore({ processSlice: mockProcessState });
    const { getByTestId, queryByText } = testRenderer(TestComponent, realStore);

    expect(queryByText(/Upload Files/i)).toBeInTheDocument();
    fireEvent.click(getByTestId('upload'));

    await waitFor(() =>
      expect(realStore.getState().processSlice.uploadedFileIds).toContain(1)
    );

    expect(queryByText(/Upload Files/i)).not.toBeInTheDocument();
    expect(queryByText(/Finish Uploading/i)).toBeInTheDocument();
    fireEvent.click(getByTestId('finish-upload'));

    await waitFor(() => {
      expect(realStore.getState().processSlice.fileIds).toContain(1);
      expect(queryByText(/Upload Files/i)).toBeInTheDocument();
    });
  });

  it('on repeated upload file ids needs to be available in process slice', async () => {
    const mockProcessState: ProcessState = {
      ...processReducerInitialState,
      fileIds: [1],
      uploadedFileIds: [1],
      showFileUploadModal: true,
    };

    const realStore = getRealStore({ processSlice: mockProcessState });

    const { getByTestId, queryByText } = testRenderer(TestComponent, realStore);

    expect(queryByText(/Upload Files/i)).toBeInTheDocument();
    fireEvent.click(getByTestId('upload'));

    await waitFor(() =>
      expect(realStore.getState().processSlice.uploadedFileIds).toContain(2)
    );

    expect(queryByText(/Upload Files/i)).not.toBeInTheDocument();
    expect(queryByText(/Finish Uploading/i)).toBeInTheDocument();
    fireEvent.click(getByTestId('finish-upload'));

    await waitFor(() => {
      expect(realStore.getState().processSlice.fileIds).toEqual(
        expect.arrayContaining([1, 2])
      );
      expect(queryByText(/Upload Files/i)).toBeInTheDocument();
    });
  });
});

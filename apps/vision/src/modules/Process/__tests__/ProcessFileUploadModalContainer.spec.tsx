// mock file upload implementation
import React from 'react';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { testRenderer } from '../../../__test-utils/renderer';
import { getRealStore } from '../../../__test-utils/store.utils';
import { ProcessFileUploadModalContainer } from '../Containers/ProcessFileUploadModalContainer';
import { processReducerInitialState } from '../store/slice';
import { ProcessState } from '../store/types';

jest.mock(
  '@vision/modules/Common/Components/FileUploaderModal/FileUploaderModal'
);

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
    testRenderer(TestComponent, realStore);

    expect(screen.getByText(/Upload Files/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('upload'));

    await waitFor(() =>
      expect(realStore.getState().processSlice.uploadedFileIds).toContain(1)
    );

    expect(screen.queryByText(/Upload Files/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Finish Uploading/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('finish-upload'));

    await waitFor(() => {
      expect(realStore.getState().processSlice.fileIds).toContain(1);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Finish Uploading/i)).not.toBeInTheDocument();
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

    testRenderer(TestComponent, realStore);

    expect(screen.getByText(/Upload Files/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('upload'));

    await waitFor(() =>
      expect(realStore.getState().processSlice.uploadedFileIds).toContain(2)
    );

    expect(screen.queryByText(/Upload Files/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Finish Uploading/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('finish-upload'));

    await waitFor(() => {
      expect(realStore.getState().processSlice.fileIds).toEqual(
        expect.arrayContaining([1, 2])
      );
    });

    await waitFor(() => {
      expect(screen.queryByText(/Finish Uploading/i)).not.toBeInTheDocument();
    });
  });
});

import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { ProcessToolBar } from 'src/modules/Process/Containers/ProcessToolBar/ProcessToolBar';
import { getRealStore } from 'src/__test-utils/store.utils';
import { testRendererModals } from 'src/__test-utils/renderer';
import { fireEvent, screen, within } from '@testing-library/react';
import { processReducerInitialState } from 'src/modules/Process/store/slice';
import { ProcessState } from 'src/modules/Process/store/types';
import { initialState as fileState } from 'src/modules/Common/store/files/slice';
import { FileState } from 'src/modules/Common/store/files/types';
import { mockFileInfo } from 'src/__test-utils/data/mockFileInfo';
import {
  mockedOCRGetRes,
  mockedOCRPostRes,
} from 'src/__test-utils/fixtures/jobs/ocr';
import { convertToVisionFileState } from 'src/__test-utils/files';

// Use msw to intercept the network request during the test,
export const handlers = [
  rest.post('*/context/vision/ocr', (req, res, ctx) => {
    return res(ctx.json(mockedOCRPostRes), ctx.delay(150));
  }),
  rest.get('*/context/vision/ocr/123', (req, res, ctx) => {
    return res(ctx.json(mockedOCRGetRes), ctx.delay(150));
  }),
];

const server = setupServer(...handlers);

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());

// real store will use in these tests as we expect changes in ui after state changes.
describe('ProcessToolBar', () => {
  const TestComponent = (props: any) => {
    return <ProcessToolBar {...props} />;
  };

  it('Initial state of ProcessToolBar', () => {
    const realStore = getRealStore();
    testRendererModals(TestComponent, realStore);

    // Add files and Select ML modal(s) should be displayed. Select ML modal(s) should be disabled
    expect(screen.getByText('Add files')).toBeInTheDocument();
    expect(screen.getByText('Select ML model(s)')).toBeInTheDocument();
    expect(screen.queryByText('Files processed')).not.toBeInTheDocument();
    expect(screen.getByTestId('Detect Button')).toBeDisabled();
  });

  it('Start detection job with ocr job', async () => {
    const mockVisionFileState = convertToVisionFileState(mockFileInfo);
    const mockFileState: FileState = {
      ...fileState,
      files: mockVisionFileState,
    };
    const mockProcessState: ProcessState = {
      ...processReducerInitialState,
      fileIds: mockVisionFileState.allIds,
    };

    const realStore = getRealStore({
      fileReducer: mockFileState,
      processSlice: mockProcessState,
    });
    testRendererModals(TestComponent, realStore);

    expect(screen.getByText('Add files')).toBeInTheDocument();
    expect(screen.getByText('Select ML model(s)')).toBeInTheDocument();
    expect(screen.getByTestId('Detect Button')).not.toBeDisabled();

    const modelSelect = screen.getByRole('textbox');
    expect(modelSelect).toBeInTheDocument();
    modelSelect
      .querySelectorAll<HTMLElement>('.cogs-select__multi-value')
      .forEach((el) => {
        // test Text Detection is selected.
        expect(within(el).getByText('Text detection')).toBeInTheDocument();
        expect(
          within(el).getByText('Asset tag detection')
        ).not.toBeInTheDocument();
        expect(
          within(el).getByText('Object detection')
        ).not.toBeInTheDocument();
      });

    fireEvent.click(screen.getByRole('button', { name: 'Detect' }));
    expect(await screen.findByText('Processing files')).toBeInTheDocument();
  });
});

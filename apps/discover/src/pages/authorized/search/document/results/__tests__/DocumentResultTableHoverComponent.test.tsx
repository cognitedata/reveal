import { screen, fireEvent, act } from '@testing-library/react';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { DocumentResultTableHoverComponent } from '../DocumentResultTableHoverComponent';

describe('DocumentResultTableHoverComponent', () => {
  const store = getMockedStore();

  const onPreviewHandle = jest.fn();
  const onExtractParentFolderHandle = jest.fn();
  const onOpenFeedbackHandle = jest.fn();

  const getDefaultProps = () => {
    return {
      row: {
        original: getMockDocument(),
      },
      onPreviewHandle,
      onOpenFeedbackHandle,
      onExtractParentFolderHandle,
    };
  };

  const renderPage = () =>
    testRenderer(DocumentResultTableHoverComponent, store, getDefaultProps());

  it('should fire callbacks on click', () => {
    renderPage();

    act(() => {
      fireEvent.click(screen.getByTestId('button-preview-document'));
      fireEvent.click(screen.getByText('Open parent folder'));
      fireEvent.click(screen.getByText('Leave feedback'));
    });

    expect(onPreviewHandle).toBeCalled();
    expect(onExtractParentFolderHandle).toBeCalled();
    expect(onOpenFeedbackHandle).toBeCalled();
  });
});

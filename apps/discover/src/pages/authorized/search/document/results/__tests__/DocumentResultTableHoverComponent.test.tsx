import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import {
  LEAVE_FEEDBACK_OPTION_TEXT,
  OPEN_PARENT_FOLDER_OPTION_TEXT,
} from '../../constants';
import { DocumentResultTableHoverComponent } from '../DocumentResultTableHoverComponent';

describe('DocumentResultTableHoverComponent', () => {
  const store = getMockedStore();

  const onPreviewHandle = jest.fn();
  const onExtractParentFolderHandle = jest.fn();
  const onOpenFeedbackHandle = jest.fn();

  const getDefaultProps = () => {
    return {
      doc: getMockDocument(),
      onPreviewHandle,
      onOpenFeedbackHandle,
      onExtractParentFolderHandle,
    };
  };

  const renderPage = () =>
    testRenderer(DocumentResultTableHoverComponent, store, getDefaultProps());

  it('should fire callbacks on click', () => {
    renderPage();

    userEvent.hover(screen.getByTestId('menu-button'));

    fireEvent.click(screen.getByTestId('button-preview-document'));
    fireEvent.click(screen.getByText(OPEN_PARENT_FOLDER_OPTION_TEXT));
    fireEvent.click(screen.getByText(LEAVE_FEEDBACK_OPTION_TEXT));

    expect(onPreviewHandle).toBeCalled();
    expect(onExtractParentFolderHandle).toBeCalled();
    expect(onOpenFeedbackHandle).toBeCalled();
  });
});

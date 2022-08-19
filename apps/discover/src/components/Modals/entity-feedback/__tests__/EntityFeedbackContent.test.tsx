import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import {
  INCORRECT_DOCUMENT_TYPE_CHECKBOX_LABEL,
  INCORRECT_GEO_CHECKBOX_LABEL,
  OTHER_CHECKBOX_LABEL,
  SENSITIVE_DATA_CHECKBOX_LABEL,
} from 'components/Modals/constants';

import { EntityFeedbackContent, Props } from '../EntityFeedbackContent';

describe('EntityFeedbackContent Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRendererModal(EntityFeedbackContent, undefined, viewProps);
  it('should render checkboxes and callbacks work', async () => {
    const handleCheckChanged = jest.fn();
    const handleSetCorrectDocumentType = jest.fn();
    const handleTextChanged = jest.fn();
    await testInit({
      isSensitiveData: true,
      isIncorrectGeo: true,
      isIncorrectDocType: true,
      isOther: true,
      freeText: 'TEST_TEXT',
      currentDocumentType: ['test1'],
      documentTypes: [
        { name: 'test1', count: 0 },
        { name: 'test2', count: 0 },
      ],
      handleCheckChanged,
      handleSetCorrectDocumentType,
      handleTextChanged,
    });

    const sensitiveDataCheckbox = screen.getByLabelText(
      SENSITIVE_DATA_CHECKBOX_LABEL
    );
    expect(sensitiveDataCheckbox).toBeInTheDocument();
    expect(sensitiveDataCheckbox).toBeChecked();

    fireEvent.click(sensitiveDataCheckbox);

    expect(handleCheckChanged).toHaveBeenCalledWith('isSensitiveData', false);

    const incorrectGeoCheckbox = screen.getByLabelText(
      INCORRECT_GEO_CHECKBOX_LABEL
    );
    expect(incorrectGeoCheckbox).toBeInTheDocument();
    expect(incorrectGeoCheckbox).toBeChecked();
    if (incorrectGeoCheckbox) {
      fireEvent.click(incorrectGeoCheckbox);
    }
    expect(handleCheckChanged).toHaveBeenCalledWith('isIncorrectGeo', false);

    const feedbackIncorrectDocTypeCheckbox = screen.getByLabelText(
      INCORRECT_DOCUMENT_TYPE_CHECKBOX_LABEL
    );

    expect(feedbackIncorrectDocTypeCheckbox).toBeInTheDocument();
    expect(feedbackIncorrectDocTypeCheckbox).toBeChecked();

    fireEvent.click(feedbackIncorrectDocTypeCheckbox);
    expect(handleCheckChanged).toHaveBeenCalledWith(
      'isIncorrectDocType',
      false
    );

    const feedbackOtherCheckbox = screen.getByLabelText(OTHER_CHECKBOX_LABEL);
    expect(feedbackOtherCheckbox).toBeInTheDocument();
    expect(feedbackOtherCheckbox).toBeChecked();

    fireEvent.click(feedbackOtherCheckbox);
    expect(handleCheckChanged).toHaveBeenCalledWith('isOther', false);
    expect(screen.getByTestId('feedback-text')).toHaveValue('TEST_TEXT');
    expect(screen.getByTestId('imminent-remove-note')).toBeInTheDocument();
  });
});

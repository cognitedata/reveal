import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { EntityFeedbackContent, Props } from '../EntityFeedbackContent';

describe('EntityFeedbackContent Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRendererModal(EntityFeedbackContent, undefined, viewProps);
  it('should render checkboxes and callbacks work', async () => {
    const handleCheckChanged = jest.fn();
    const handleSetCorrectDocumentType = jest.fn();
    const handleTextChanged = jest.fn();
    const { getByCheckbox } = await testInit({
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

    const sensitiveData = screen.getByTestId('sensitive-data-checkbox');
    const sensitiveDataCheckbox = getByCheckbox(sensitiveData);
    expect(sensitiveDataCheckbox).toBeTruthy();
    expect(sensitiveDataCheckbox).toHaveProperty('checked', true);
    if (sensitiveDataCheckbox) {
      fireEvent.click(sensitiveDataCheckbox);
    }
    expect(handleCheckChanged).toHaveBeenCalledWith('isSensitiveData', false);

    const incorrectGeo = screen.getByTestId('incorrect-geo-checkbox');
    const incorrectGeoCheckbox = getByCheckbox(incorrectGeo);
    expect(incorrectGeoCheckbox).toBeTruthy();
    expect(incorrectGeoCheckbox).toHaveProperty('checked', true);
    if (incorrectGeoCheckbox) {
      fireEvent.click(incorrectGeoCheckbox);
    }
    expect(handleCheckChanged).toHaveBeenCalledWith('isIncorrectGeo', false);

    const feedbackIncorrectDocType = screen.getByTestId(
      'feedback-incorrectdoctype-checkbox'
    );
    const feedbackIncorrectDocTypeCheckbox = getByCheckbox(
      feedbackIncorrectDocType
    );
    expect(feedbackIncorrectDocTypeCheckbox).toBeTruthy();
    expect(feedbackIncorrectDocTypeCheckbox).toHaveProperty('checked', true);
    if (feedbackIncorrectDocTypeCheckbox) {
      fireEvent.click(feedbackIncorrectDocTypeCheckbox);
    }
    expect(handleCheckChanged).toHaveBeenCalledWith(
      'isIncorrectDocType',
      false
    );

    const feedbackOther = screen.getByTestId('feedback-other-checkbox');
    const feedbackOtherCheckbox = getByCheckbox(feedbackOther);
    expect(feedbackOtherCheckbox).toBeTruthy();
    expect(feedbackOtherCheckbox).toHaveProperty('checked', true);
    if (feedbackOtherCheckbox) {
      fireEvent.click(feedbackOtherCheckbox);
    }
    expect(handleCheckChanged).toHaveBeenCalledWith('isOther', false);
    expect(screen.getByTestId('feedback-text')).toHaveValue('TEST_TEXT');
    expect(screen.getByTestId('imminent-remove-note')).toBeInTheDocument();
  });
});

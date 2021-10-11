import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import {
  FEEDBACK_INPUT_PLACEHOLDER,
  INCORRECT_GEO_CHECKBOX_LABEL,
  SENSITIVE_DATA_CHECKBOX_LABEL,
} from '../../src/components/modals/constants';
import {
  FEEDBACK_ERROR_HEADER,
  FEEDBACK_CONFIRM_TOAST,
} from '../../src/constants/feedback';
import { progress } from '../utils';

class ObjectFeedbackDialog {
  public readonly header = Selector('div').withText('Feedback');

  public readonly sensitiveCheckbox = screen.getByText(
    SENSITIVE_DATA_CHECKBOX_LABEL
  );

  public readonly incorrectGeotaggedCheckbox = screen.getByText(
    INCORRECT_GEO_CHECKBOX_LABEL
  );

  public readonly documentTypeDescription = screen.getByPlaceholderText(
    FEEDBACK_INPUT_PLACEHOLDER
  );

  public readonly confirmationText = screen.queryAllByText(
    FEEDBACK_CONFIRM_TOAST
  );

  public readonly error = Selector('div').withText(FEEDBACK_ERROR_HEADER);

  public readonly sendButton = Selector('button').withText('Send');

  public readonly undoButton = Selector('button').withText('Undo');

  fillInDescription = async (description: string) => {
    progress('Fill in document type description');
    await t.typeText(this.documentTypeDescription, description);
  };

  clickSensitiveCheckbox = async () => {
    progress('Click sensitive box');
    await t.click(this.sensitiveCheckbox);
  };

  clickIncorrectDocumentTypeCheckbox = async () => {
    progress(`Click incorrect document type checkbox`);
    await t.click(this.incorrectGeotaggedCheckbox);
  };

  clickSendButtonAndCheckForConfirmationToast = async () => {
    progress('Click send button');
    await t.click(this.sendButton);

    progress('Check for confirmation toast', true);
    await t.expect(this.confirmationText.exists).ok({ timeout: 500 });
    await t.expect(this.error.exists).notOk({ timeout: 500 });
  };

  clickUndoButton = async () => {
    progress('Click undo butoon');
    await t.click(this.undoButton);

    progress('Expect confirmation text to disappear', true);
    await t.expect(this.confirmationText.exists).notOk({ timeout: 1000 });
  };
}

export default new ObjectFeedbackDialog();

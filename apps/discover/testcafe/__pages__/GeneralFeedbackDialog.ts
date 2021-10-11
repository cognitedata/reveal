import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import { FEEDBACK_CONFIRM_TOAST } from '../../src/constants/feedback';
import { progress } from '../utils';

import App from './App';

class GeneralFeedbackDialog {
  public readonly container = Selector(
    '[data-testid="GeneralFeedback-Container"]'
  );

  public readonly textInput = Selector(
    '[data-testid="general-feedback-input"]'
  );

  public readonly cancelButton = Selector('button').withText('Cancel');

  public readonly confirmButton = Selector('button').withText('Send');

  public readonly modalBackdrop = Selector('.ReactModal__Overlay');

  public readonly successMessage = screen.queryAllByText(
    FEEDBACK_CONFIRM_TOAST
  );

  checkIfFeedbackModalIsOpen = async () => {
    progress(`Check if the feedback modal is open`);
    await t.expect(App.generalFeedbackDialog.container.exists).ok();
  };

  checkIfFeedbackModalIsClose = async () => {
    progress(`Check if the feedback modal is open`);
    await t.expect(App.generalFeedbackDialog.container.exists).notOk();
  };

  openFeedbackModal = async () => {
    progress(`Open the feedback modal`);
    await t
      .click(App.topbar.feedbackDropdown)
      .click(App.topbar.generalFeedbackLink);
    await this.checkIfFeedbackModalIsOpen();
  };

  closeFeedbackModal = async () => {
    progress(`Close the feedback modal`);
    await t.click(this.modalBackdrop, {
      offsetX: 500,
      offsetY: 1,
      speed: 0.3,
    });
    await this.checkIfFeedbackModalIsClose();
  };

  cancelFeedbackModal = async () => {
    progress(`Cancel the feedback modal`);
    await t.click(this.cancelButton);
    await this.checkIfFeedbackModalIsClose();
  };

  writeFeedback = async (feedback: string) => {
    progress(`Write feedback: ${feedback}`);
    await t.typeText(this.textInput, feedback);
    await this.checkIfFeedbackTextInputValueEqualsTo(feedback);
  };

  checkIfFeedbackTextInputValueEqualsTo = async (expected: string) => {
    progress(`Check if feedback text input values equals to: ${expected}`);
    await t.expect(this.textInput.value).eql(expected);
  };

  sendFeedback = async () => {
    progress('Send feedback');

    progress('Click the `Send` button', true);
    await t.click(this.confirmButton);

    await App.checkifToasterAppears(FEEDBACK_CONFIRM_TOAST);
  };

  /**
   * TODO: Why are we testing toastr functionality??
   */
  checkIfUndoToastDisappears = async (timeout = 6000) => {
    progress('Check if undo toast disappears');
    await t
      .expect(App.generalFeedbackDialog.successMessage.exists)
      .notOk({ timeout });
  };
}

export default new GeneralFeedbackDialog();

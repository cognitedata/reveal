import { t } from 'testcafe';

import App from '../../__pages__/App';
import { regularUser } from '../../__roles__/users';
import { startTest, logErrors, getPostLogger } from '../../utils';

const expected = 'Hello';
const feedbackText = 'new general feedback from e2e test';

const loggerPost = getPostLogger();

fixture('Feedback - General')
  .requestHooks(loggerPost)
  .meta({ page: 'feedback:general', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(() => t.useRole(regularUser))
  .afterEach(() => logErrors());

startTest(
  'Clicking link in top bar opens general feedback, and clicking outside closes modal',
  async () => {
    await App.generalFeedbackDialog.openFeedbackModal();
    await App.generalFeedbackDialog.closeFeedbackModal();
  }
);

startTest(
  'Clicking cancel button closes feedback modal and deletes text input',
  async () => {
    await App.generalFeedbackDialog.openFeedbackModal();
    await App.generalFeedbackDialog.writeFeedback(expected);
    await App.generalFeedbackDialog.cancelFeedbackModal();
    await App.generalFeedbackDialog.openFeedbackModal();
    await App.generalFeedbackDialog.checkIfFeedbackTextInputValueEqualsTo('');
    await App.generalFeedbackDialog.cancelFeedbackModal();
  }
);

startTest('Submitting general feedback succeeds', async () => {
  await App.generalFeedbackDialog.openFeedbackModal();
  await App.generalFeedbackDialog.writeFeedback(feedbackText);
  await App.generalFeedbackDialog.sendFeedback();
  await App.generalFeedbackDialog.checkIfUndoToastDisappears();
});

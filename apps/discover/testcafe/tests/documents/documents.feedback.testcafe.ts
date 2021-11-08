import { t } from 'testcafe';

import App from '../../__pages__/App';
import { startTest, logErrors } from '../../utils';

fixture('Feedback - document')
  .meta({ page: 'feedback:document', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    await App.navigateToResultsPage('Documents');
  })
  .afterEach(() => logErrors({ error: true, warn: true, info: true }));

// startTest('Undo reporting a document as sensitive', async () => {
//   await App.filterClearPage.clearAllFilters();
//   await App.documentSearchPage.doSearch(`filename:'${filename}'`);
//   await App.documentSearchPage.clickDocumentFeedbackButton();
//   await App.objectFeedbackDialog.clickSensitiveCheckbox();
//   await App.objectFeedbackDialog.clickSendButtonAndCheckForConfirmationToast();
//   await App.objectFeedbackDialog.clickUndoButton();
// });

// startTest('Report a document as sensitive', async () => {
//   await App.documentSearchPage.doSearch(`filename:'${filename}'`);
//   await App.documentSearchPage.clickDocumentFeedbackButton();
//   await App.objectFeedbackDialog.clickSensitiveCheckbox();
//   await App.objectFeedbackDialog.clickSendButtonAndCheckForConfirmationToast();
//   await App.objectFeedbackDialog.clickUndoButton();
// });

startTest('Report wrongfully geotagged document', async () => {
  await App.documentSearchPage.doCommonSearch();
  await App.documentSearchPage.clickDocumentFeedbackButton();
  await App.objectFeedbackDialog.clickIncorrectDocumentTypeCheckbox();
  await App.objectFeedbackDialog.clickSendButtonAndCheckForConfirmationToast();
  await App.objectFeedbackDialog.clickUndoButton();
});

startTest('Report a new document type for a document', async () => {
  await App.documentSearchPage.doCommonSearch();
  await App.documentSearchPage.clickDocumentFeedbackButton();
  await App.objectFeedbackDialog.clickIncorrectDocumentTypeCheckbox();
  await App.objectFeedbackDialog.fillInDescription('TEST_TYPE_1');
  await App.objectFeedbackDialog.clickSendButtonAndCheckForConfirmationToast();
  await App.objectFeedbackDialog.clickUndoButton();
});

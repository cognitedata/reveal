import { t } from 'testcafe';

import App /* , { filename } */ from '../../__pages__/App';
import { deleteFavorites } from '../../fixtures/favorites';
import { deleteSavedSearches } from '../../fixtures/savedSearches';
import {
  /* startTest, testRunId, */
  getNetworkLogger,
  logErrors,
} from '../../utils';

// const sensitiveComment = `${testRunId}_SENSITIVE`;
const logger = getNetworkLogger();

fixture('Admin - Document Feedback')
  .meta({ page: 'admin:feedback:document', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .before(async () => {
    await deleteFavorites();
    await deleteSavedSearches();
  })
  .beforeEach(async () => {
    await t.useRole(App.getAdminRole());
  })
  .afterEach(() => logErrors({ error: true }))
  .requestHooks(logger);

// startTest('Report a document as sensitive', async () => {
//   await App.documentSearchPage.doSearch(`filename:'${filename}'`, false);
//   await App.resultTable.goToMoreOptionsOfRowIncludesCell(filename);
//   await App.resultTable.selectOptionFromMoreOptionsDropdown('Leave feedback');
//   await App.objectFeedbackDialog.clickSensitiveCheckbox();
//   await App.objectFeedbackDialog.fillInDescription(sensitiveComment);
//   await App.objectFeedbackDialog.clickSendButtonAndCheckForConfirmationToast();
//   await App.objectFeedbackDialog.clickUndoButton();
// });

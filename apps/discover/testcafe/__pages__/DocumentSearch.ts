import { within } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import { progress } from '../utils';

import App, { filename } from './App';
import { BaseSearchPage } from './BaseSearch';

class DocumentSearchPage extends BaseSearchPage {
  documentPreviewModal = Selector('div[class*="cogs-modal-header"]');

  previewCloseButton = Selector('button').withAttribute(
    'data-testid',
    'preview-card-close-button'
  );

  extractByParentButton = Selector('button').withAttribute(
    'data-testid',
    'button-extract-parent-folder'
  );

  parentPath = Selector('[data-testid="document-parent-path"]');

  feedbackButton = Selector('button').withAttribute(
    'data-testid',
    'button-feedback'
  );

  documentMetadata = Selector('div').withAttribute(
    'data-testid',
    'document-metadata'
  );

  addToFavoriteButton = Selector(
    '[data-testid="document-favorite-all-button"]'
  );

  resizeIcon = Selector('[data-testid="resize-handle-horizontal"]');

  doCommonSearch = async (filenameToSearch?: string) => {
    await this.doSearch(`${filenameToSearch || filename}`);
  };

  checkIfTextExistsInDocumentMetadata = async (text: string) => {
    progress(`Checking if '${text}' exists in document metadata section`);
    await t.wait(2000);
    await t.expect(within(this.documentMetadata).getByText(text).exists).ok();
  };

  addToFavoriteSet = (setName: string) =>
    Selector('[data-testid="add-to-favorites-panel"]')
      .find('button')
      .withText(setName);

  clickDocumentFeedbackButton = async () => {
    await App.resultTable.goToMoreOptionsOfRowIncludesCell(filename);
    await App.resultTable.selectOptionFromMoreOptionsDropdown('Leave feedback');

    progress('Check if document feedback appears', true);
    await t.expect(App.objectFeedbackDialog.header().exists).ok();
  };

  addSelectedDocumentsToFavoriteSet = async (setName: string) => {
    progress('Click the add to favorites button');
    await t.click(this.addToFavoriteButton);

    progress('Check that the list of favorite-sets appears');
    const favoriteSet = App.documentSearchPage.addToFavoriteSet(setName);
    await t.expect(favoriteSet.exists).ok({ timeout: 2000 });

    progress('Add to favorite set');
    await t.click(favoriteSet);
  };

  searchAndApplyFilters = async (
    searchPhrase: string,
    fileType: string,
    documentCategory: string,
    source: string
  ) => {
    await App.documentSearchPage.doSearch(searchPhrase);

    await App.sidebar.clickFilterCategory('Documents');
    await App.sidebar.clickFilterSubCategory('File Type');
    await App.sidebar.clickFilterOption(fileType);

    await App.sidebar.clickFilterSubCategory('Document Category');
    await App.sidebar.clickFilterOption(documentCategory);

    await App.sidebar.clickFilterSubCategory('Source');
    await App.sidebar.clickFilterOption(source);
  };

  verifySearchPhraseAndFilters = async (
    searchPhrase: string,
    fileType: string,
    documentCategory: string,
    source: string,
    filtersExist: boolean
  ) => {
    await App.documentSearchPage.checkIfSearchPhraseNotEqualsTo(searchPhrase);

    await App.sidebar.clickFilterCategory('Documents');
    await App.sidebar.clickFilterSubCategory('File Type');
    await App.sidebar.fileType.isChecked(fileType, filtersExist);

    await App.sidebar.clickFilterSubCategory('Document Category');
    await App.sidebar.fileType.isChecked(documentCategory, filtersExist);

    await App.sidebar.clickFilterSubCategory('Source');
    await App.sidebar.fileType.isChecked(source, filtersExist);
  };
}

export default new DocumentSearchPage();

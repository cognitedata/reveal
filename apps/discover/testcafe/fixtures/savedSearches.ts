// import { documentFacetsStructure as emptyFacets } from '../../src/modules/api/documents/structure';

import {
  normalizeSavedSearch,
  SavedSearchContent,
  savedSearches,
} from '../../src/modules/api/savedSearches';
import { adaptSaveSearchContentToSchemaBody } from '../../src/modules/api/savedSearches/adaptSavedSearch';
import App from '../__pages__/App';
import { getTokenHeaders, progress } from '../utils';

export const deleteSavedSearches = async (
  savedSearch: Partial<SavedSearchContent> = {}
) => {
  const headers = await getTokenHeaders();
  // console.log('ID token:', token);

  progress(`Starting to delete all saved searches`);
  const savedSearchesList = await savedSearches.list(headers, App.project);

  const deleting = savedSearchesList.map((savedSearch) => {
    if (!savedSearch.value.id) {
      progress(`Saved search with no name found: ${savedSearch.value}`);
      return Promise.resolve();
    }

    progress(`Deleting saved search: ${savedSearch.value.name}`);
    return savedSearches.delete(savedSearch.value.id, headers, App.project);
  });

  const normalizeResult = await normalizeSavedSearch(savedSearch);

  const id = 'current';
  const body = adaptSaveSearchContentToSchemaBody(normalizeResult);

  try {
    await Promise.all(deleting);
    // await savedSearches.delete('current', token, App.project);
    await savedSearches.create(id, body, headers, App.project);
  } catch (error) {
    console.error(error);
  }

  progress(`Deletion of all saved searches complete`);
  progress(` `);
};

export const createSavedSearches = async (
  id: string,
  savedSearch: Partial<SavedSearchContent> = {}
) => {
  const headers = await getTokenHeaders();

  const normalizeResult = await normalizeSavedSearch(savedSearch);
  const body = adaptSaveSearchContentToSchemaBody(normalizeResult);

  try {
    await savedSearches.create(id, body, headers, App.project);
  } catch (error) {
    console.error(error);
  }
};

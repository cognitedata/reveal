// import { documentFacetsStructure as emptyFacets } from '../../src/modules/api/documents/structure';
import {
  normalizeSavedSearch,
  SavedSearchContent,
  savedSearches,
} from '../../src/modules/api/savedSearches';
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
    progress(`Deleting saved search: ${savedSearch.value.name}`);
    return savedSearches.delete(savedSearch.value.id, headers, App.project);
  });

  const normalizeResult = await normalizeSavedSearch(savedSearch);
  try {
    await Promise.all(deleting);
    // await savedSearches.delete('current', token, App.project);
    await savedSearches.save(normalizeResult, 'current', headers, App.project);
  } catch (error) {
    console.error(error);
  }

  progress(`Deletion of all saved searches complete`);
  progress(` `);
};

export const createSavedSearches = async (
  name: string,
  savedSearch: Partial<SavedSearchContent> = {}
) => {
  const headers = await getTokenHeaders();

  const normalizeResult = await normalizeSavedSearch(savedSearch);
  try {
    await savedSearches.save(normalizeResult, name, headers, App.project);
  } catch (error) {
    console.error(error);
  }
};

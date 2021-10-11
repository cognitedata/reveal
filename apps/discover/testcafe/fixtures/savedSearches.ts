// import { documentFacetsStructure as emptyFacets } from '../../src/modules/api/documents/structure';
import {
  normalizeSavedSearch,
  SavedSearchContent,
  savedSearches,
} from '../../src/modules/api/savedSearches';
import App from '../__pages__/App';
import { getTokenHeaders } from '../utils';

export const deleteSavedSearches = async (
  savedSearch: Partial<SavedSearchContent> = {}
) => {
  const token = await getTokenHeaders();
  // console.log('ID token:', token);

  const savedSearchesList = await savedSearches.list(token, App.tenant);

  const deleting = savedSearchesList.map((savedSearch) => {
    return savedSearches.delete(savedSearch.value.id, token, App.tenant);
  });

  const normalizeResult = await normalizeSavedSearch(savedSearch);
  try {
    await Promise.all(deleting);
    // await savedSearches.delete('current', token, App.tenant);
    await savedSearches.save(normalizeResult, 'current', token, App.tenant);
  } catch (error) {
    console.error(error);
  }
};

export const createSavedSearches = async (
  name: string,
  savedSearch: Partial<SavedSearchContent> = {}
) => {
  const token = await getTokenHeaders();

  const normalizeResult = await normalizeSavedSearch(savedSearch);
  try {
    await savedSearches.save(normalizeResult, name, token, App.tenant);
  } catch (error) {
    console.error(error);
  }
};

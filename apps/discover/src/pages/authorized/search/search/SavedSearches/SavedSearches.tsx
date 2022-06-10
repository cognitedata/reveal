import { useSavedSearchCreateMutate } from 'domain/savedSearches/internal/actions/useSavedSearchCreateMutate';
import { useSavedSearchDeleteMutate } from 'domain/savedSearches/internal/actions/useSavedSearchDeleteMutate';
import { adaptSaveSearchContentToSchemaBody } from 'domain/savedSearches/internal/adapters/adaptSaveSearchContentToSchemaBody';
import { useSavedSearch } from 'domain/savedSearches/internal/hooks';
import { useQuerySavedSearchesList } from 'domain/savedSearches/internal/queries/useQuerySavedSearchesList';
import { SavedSearchContent } from 'domain/savedSearches/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GenericApiError } from 'services/types';
import { isEnterPressed } from 'utils/general.helper';
import { log } from 'utils/log';

import { Dropdown, Input, Menu, Tooltip, Button } from '@cognite/cogs.js';

import Divider from 'components/Divider';
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import OverwriteSearchModal from 'components/Modals/overwrite-search-modal';
import Skeleton from 'components/Skeleton';
import { showErrorMessage, showSuccessMessage } from 'components/Toast';
import { useCurrentSavedSearchState } from 'hooks/useCurrentSavedSearchState';
import { useSavedSearchNavigation } from 'hooks/useSavedSearchNavigation';

import {
  SAVED_SEARCHES_MENU_CREATE_NEW_TEXT,
  SAVED_SEARCH_INPUT_PLACEHOLDER,
  SAVED_SEARCH_ADDED_MESSAGE_TEXT,
  SAVED_SEARCH_ERROR_MESSAGE_TEXT,
} from './constants';
import {
  SavedSearchWrapper,
  SavedSearchInputWrapper,
  SavedSearchesButton,
  SavedSearchListContent,
  SavedSearchTitle,
  SavedSearchDivider,
  MenuItemWrapper,
} from './elements';

export const ExistingSavedSearches: React.FC<{
  handleLoad: () => void;
}> = ({ handleLoad }) => {
  const { data, isLoading } = useQuerySavedSearchesList();
  const loadSavedSearch = useSavedSearch();
  const handleSavedSearchNavigation = useSavedSearchNavigation();

  const handleLoadSavedSearch = (name: string) => async () => {
    // console.log('All saved searh data:', data);
    const selected = data?.find((item) => item.name === name);

    // make the selected one the current
    if (selected) {
      // console.log('Loading saved search:', selected.value);
      loadSavedSearch(selected.value);
      showSuccessMessage('Loading saved search.');
      handleLoad();
      handleSavedSearchNavigation(selected);
    }
  };

  const hasSavedData = data && data.length > 0;

  return (
    <>
      {hasSavedData && (
        <SavedSearchDivider>
          <Divider />
        </SavedSearchDivider>
      )}
      <SavedSearchListContent>
        {hasSavedData && <SavedSearchTitle>Saved</SavedSearchTitle>}

        {isLoading && <Skeleton.List lines={1} />}

        {(data || []).map((search) => {
          return (
            <MenuItemWrapper
              key={search.value.id}
              onClick={handleLoadSavedSearch(search.name)}
            >
              <MiddleEllipsis value={search.name} fixedLength={25} />
            </MenuItemWrapper>
          );
        })}
      </SavedSearchListContent>
    </>
  );
};

export const SavedSearches: React.FC = React.memo(() => {
  const { t } = useTranslation('SearchMenu');
  const [currentName, setCurrentName] = React.useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isOverwriteSearchModalOpen, setIsOverwriteSearchModalOpen] =
    useState(false);
  const handleOverWriteSearchModel = () => {
    setIsOverwriteSearchModalOpen(false);
    setCurrentName('');
  };
  // temp, need to refactor the api call into a mutate file
  const currentSavedSearch = useCurrentSavedSearchState();
  const savedSearchList = useQuerySavedSearchesList();

  const { mutateAsync: createSavedSearch } = useSavedSearchCreateMutate();
  const { mutateAsync: deleteSavedSearch } = useSavedSearchDeleteMutate();

  const isCurrentNameInSavedSearch = savedSearchList.data?.find(
    (record) => record.name === currentName
  );

  const overWriteSearch = async () => {
    if (isCurrentNameInSavedSearch?.value.id) {
      await deleteSavedSearch(isCurrentNameInSavedSearch?.value.id);
    }
    handleCreateSavedSearch();
    setIsOverwriteSearchModalOpen(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEnterPressed(event)) {
      handleSave();
    }
  };

  const handleSave = () => {
    if (currentName === '') return;

    if (isCurrentNameInSavedSearch) {
      setIsOverwriteSearchModalOpen(true);
      return;
    }

    hideDropdown();
    handleCreateSavedSearch();
  };

  const hideDropdown = () => {
    setDropdownVisible(false);
  };

  const handleCreateSavedSearch = async () => {
    if (!currentSavedSearch) {
      showErrorMessage(SAVED_SEARCH_ERROR_MESSAGE_TEXT);
      return;
    }

    const doingCreateMutate = createSavedSearch({
      id: currentName,
      body: adaptSaveSearchContentToSchemaBody(currentSavedSearch),
    });

    setCurrentName('');
    doingCreateMutate.then(handleCreateMutateResponse).catch((error) => {
      log('Error', error);
    });
  };

  const handleCreateMutateResponse = (
    result: SavedSearchContent | GenericApiError
  ) => {
    if (result && 'error' in result) {
      showErrorMessage(SAVED_SEARCH_ERROR_MESSAGE_TEXT);
    } else {
      showSuccessMessage(SAVED_SEARCH_ADDED_MESSAGE_TEXT);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(event.target.value);
  };

  const clearable = {
    labelText: currentName,
    callback: () => {
      setCurrentName('');
    },
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const MenuContent = (
    <Menu>
      <SavedSearchTitle>
        {t(SAVED_SEARCHES_MENU_CREATE_NEW_TEXT)}
      </SavedSearchTitle>
      <OverwriteSearchModal
        isOpen={isOverwriteSearchModalOpen}
        onCancel={handleOverWriteSearchModel}
        onConfirm={overWriteSearch}
      />
      <SavedSearchWrapper>
        <SavedSearchInputWrapper>
          <Input
            name="saved-search"
            placeholder={SAVED_SEARCH_INPUT_PLACEHOLDER}
            onChange={handleChange}
            value={currentName}
            clearable={clearable}
            onKeyPress={handleKeyPress}
            data-testid="saved-search-input"
          />
          <Tooltip content={t('Save')} placement="bottom">
            <Button
              style={{ marginLeft: '8px' }}
              icon="Save"
              onClick={handleSave}
              data-testid="save-new-search-button"
            />
          </Tooltip>
        </SavedSearchInputWrapper>
      </SavedSearchWrapper>
      <ExistingSavedSearches handleLoad={hideDropdown} />
    </Menu>
  );

  const renderDropdown = React.useMemo(
    () => (
      <Dropdown
        content={MenuContent}
        placement="right-start"
        visible={dropdownVisible}
        onClickOutside={hideDropdown}
      >
        <Tooltip content={t('Saved searches')} placement="bottom">
          <SavedSearchesButton
            onClick={toggleDropdown}
            type="secondary"
            icon="Save"
            aria-label="saved search"
            data-testid="saved-searches-button"
          />
        </Tooltip>
      </Dropdown>
    ),
    [isOverwriteSearchModalOpen, currentName, dropdownVisible]
  );

  return <SavedSearchWrapper>{renderDropdown}</SavedSearchWrapper>;
});

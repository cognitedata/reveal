import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isEnterPressed } from 'utils/general.helper';
import { log } from 'utils/log';

import { Dropdown, Input, Menu, Tooltip, Icon } from '@cognite/cogs.js';
import { getTenantInfo } from '@cognite/react-container';

import Divider from 'components/divider';
import OverwriteSearchModal from 'components/modals/overwrite-search-modal';
import Skeleton from 'components/skeleton';
import { showErrorMessage, showSuccessMessage } from 'components/toast';
import { useCurrentSavedSearchState } from 'hooks/useCurrentSavedSearchState';
import { useSavedSearchNavigation } from 'hooks/useSavedSearchNavigation';
import { SavedSearchContent } from 'modules/api/savedSearches';
import { useSavedSearch } from 'modules/api/savedSearches/hooks';
import { useQuerySavedSearchesList } from 'modules/api/savedSearches/useQuery';
import {
  useSavedSearchCreateMutate,
  useSavedSearchDeleteMutate,
} from 'modules/api/savedSearches/useSavedSearchesMutate';
import { useJsonHeaders } from 'modules/api/service';
import { GenericApiError } from 'modules/api/types';

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
            <Menu.Item
              key={search.value.id}
              onClick={handleLoadSavedSearch(search.name)}
            >
              {search.name}
            </Menu.Item>
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
  const headers = useJsonHeaders();
  const currentSavedSearch = useCurrentSavedSearchState();
  const savedSearchList = useQuerySavedSearchesList();
  const [tenant] = getTenantInfo();

  const { mutateAsync: createMutate } = useSavedSearchCreateMutate();
  const { mutateAsync: deleteMutate } = useSavedSearchDeleteMutate();

  const isCurrentNameInSavedSearch = savedSearchList.data?.find(
    (record) => record.name === currentName
  );

  const overWriteSearch = async () => {
    if (isCurrentNameInSavedSearch?.value.id) {
      await deleteMutate({
        id: isCurrentNameInSavedSearch?.value.id,
        headers,
        tenant,
      });
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

    const doingCreateMutate = createMutate({
      values: currentSavedSearch,
      name: currentName,
      headers,
      tenant,
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

  const renderSaveIcon = () => (
    <Tooltip content={t('Save')} placement="bottom">
      <Icon
        type="Save"
        onClick={handleSave}
        data-testid="save-new-search-button"
      />
    </Tooltip>
  );

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
            subComponentPlacement="right"
            customSubComponent={renderSaveIcon}
            onKeyPress={handleKeyPress}
            data-testid="saved-search-input"
          />
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

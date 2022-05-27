import { getUmsUsers } from 'domain/userManagementService/service/network/getUmsUsers';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import debounce from 'lodash/debounce';
import { useJsonHeaders } from 'services/service';

import { AutoComplete, OptionsType, OptionTypeBase } from '@cognite/cogs.js';

import { SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN } from 'constants/error';

import { showErrorMessage } from '../Toast';

export interface UserOption {
  value: string;
  label: string;
}

export const SHARED_USER_INPUT_PLACEHOLDER =
  'Type names or emails to invite users...';

export interface Props {
  selectedOptions: UserOption[];
  onUsersSelectedChange: (users: UserOption[] | null) => void;
}

export const SearchUsers: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const headers = useJsonHeaders({}, true);
  const search = getUmsUsers(headers);

  const debouncedSearch = useCallback(
    debounce((value, updateAutocompleteResults) => {
      search(value)
        .then((results) => {
          updateAutocompleteResults(
            results.map((user) => ({
              value: user.id,
              label: user.displayName || user.email || 'Unknown',
            }))
          );
        })
        .catch(() => {
          showErrorMessage(SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN);
        });
    }, 300),
    []
  );

  const loadOptions = (
    value: string,
    updateAutocompleteResults: (options: OptionsType<OptionTypeBase>) => void
  ) => {
    debouncedSearch(value, updateAutocompleteResults);
  };

  return (
    <div data-testid="shared-user-autocomplete">
      <AutoComplete
        isMulti
        mode="async"
        placeholder={t(SHARED_USER_INPUT_PLACEHOLDER)}
        loadOptions={loadOptions}
        onChange={props.onUsersSelectedChange}
        value={props.selectedOptions}
      />
    </div>
  );
};

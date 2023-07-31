import { getUmsUsers } from 'domain/userManagementService/service/network/getUmsUsers';

import React, { useMemo } from 'react';

import debounce from 'lodash/debounce';

import { AutoComplete, OptionsType, OptionTypeBase } from '@cognite/cogs.js';

import { SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN } from 'constants/error';
import { useJsonHeaders } from 'hooks/useJsonHeaders';
import { useTranslation } from 'hooks/useTranslation';

import { showErrorMessage } from '../Toast';

import { SHARED_USER_INPUT_PLACEHOLDER } from './constants';

export interface UserOption {
  value: string;
  label: string;
}

export interface Props {
  selectedOptions: UserOption[];
  onUsersSelectedChange: (users: UserOption[] | null) => void;
}

export const SearchUsers: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const headers = useJsonHeaders({}, true);
  const search = getUmsUsers(headers);

  const debouncedSearch = useMemo(
    () =>
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
    [search]
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

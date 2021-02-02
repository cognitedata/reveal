import React from 'react';
import { Dropdown } from '@cognite/cogs.js';

import { FilterListProps } from './types';
import { DropdownLabel, DropdownButton, DropdownMargin } from './elements';
import { FilterListItems } from './FilterListItems';

export const FilterList = ({
  filters,
  closeHandler,
  toggleFilter,
  openFilter,
}: FilterListProps) => (
  <>
    {filters.map(
      (dropdown) =>
        dropdown.visible && (
          <DropdownMargin>
            <Dropdown
              content={FilterListItems(
                dropdown.source,
                dropdown.onSelect,
                closeHandler
              )}
              visible={openFilter === dropdown.name}
              onClickOutside={closeHandler}
            >
              <>
                <DropdownLabel>{dropdown.label}</DropdownLabel>
                <DropdownButton
                  type="secondary"
                  icon="Down"
                  iconPlacement="right"
                  onClick={() => toggleFilter(dropdown.name)}
                >
                  {dropdown.value || 'Select'}
                </DropdownButton>
              </>
            </Dropdown>
          </DropdownMargin>
        )
    )}
  </>
);

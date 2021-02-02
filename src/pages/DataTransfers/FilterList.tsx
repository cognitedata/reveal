import React from 'react';
import { Dropdown } from '@cognite/cogs.js';

import { FilterListProps } from './types';
import { DropdownLabel, DropdownButton, DropdownMargin } from './elements';

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
              content={dropdown.content}
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
                  {dropdown.buttonText}
                </DropdownButton>
              </>
            </Dropdown>
          </DropdownMargin>
        )
    )}
  </>
);

import React from 'react';

import Label from 'components/Atoms/Label';
import { Dropdown } from '@cognite/cogs.js';
import { FilterListProps } from './types';
import { DropdownButton, FieldWrapper } from './elements';
import { FilterListItems } from './FilterListItems';

export const FilterList = ({
  filters,
  closeHandler,
  toggleFilter,
  onReset,
  resetText,
  openFilter,
  placeholder = 'Select',
}: FilterListProps) => (
  <>
    {filters.map(
      (dropdown) =>
        dropdown.visible && (
          <FieldWrapper>
            <Dropdown
              content={FilterListItems(
                dropdown.source,
                dropdown.onSelect,
                closeHandler,
                onReset,
                resetText
              )}
              visible={openFilter === dropdown.name}
              onClickOutside={closeHandler}
            >
              <>
                <Label>{dropdown.label}</Label>
                <DropdownButton
                  type="secondary"
                  icon="Down"
                  iconPlacement="right"
                  onClick={() => toggleFilter(dropdown.name)}
                >
                  {dropdown.value || placeholder}
                </DropdownButton>
              </>
            </Dropdown>
          </FieldWrapper>
        )
    )}
  </>
);

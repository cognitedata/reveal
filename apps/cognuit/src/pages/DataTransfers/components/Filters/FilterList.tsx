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
          <FieldWrapper key={dropdown.name}>
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
                <DropdownButton
                  type="secondary"
                  icon="ChevronDownCompact"
                  iconPlacement="right"
                  onClick={() => toggleFilter(dropdown.name)}
                >
                  <Label>{dropdown.label}</Label>:{' '}
                  {dropdown.value || placeholder}
                </DropdownButton>
              </>
            </Dropdown>
          </FieldWrapper>
        )
    )}
  </>
);

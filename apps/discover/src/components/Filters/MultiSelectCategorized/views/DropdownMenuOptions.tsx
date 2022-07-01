import isEmpty from 'lodash/isEmpty';

import { Checkbox, Menu } from '@cognite/cogs.js';

import {
  DropdownContent,
  OptionsCategoryWrapper,
  OptionSubWrapper,
} from '../elements';
import { DropdownViewOption } from '../types';
import { selectionMap } from '../utils';

export const EMPTY_SUBMENU_OPTIONS = 'No options';

export const DropdownMenuOptions: React.FC<DropdownViewOption> = ({
  options,
  category,
  selectedOptions,
  onChangeOption,
  onChangeCategory,
}) => {
  const categoryColor = options?.[0].checkboxColor;
  const isAnySelected = !isEmpty(selectedOptions);
  const isAllSelected =
    (selectedOptions && selectedOptions.length) === options?.length;

  return (
    <OptionsCategoryWrapper>
      <Menu.Submenu
        disabled={options?.every(
          (item) => item.label === EMPTY_SUBMENU_OPTIONS
        )}
        content={
          <DropdownContent>
            {(options || []).map((option) => {
              const { label, checkboxColor } = option;
              const name = `${category}-${label}`;

              return (
                <OptionSubWrapper key={name}>
                  <Checkbox
                    disabled={label === EMPTY_SUBMENU_OPTIONS}
                    name={name}
                    color={checkboxColor}
                    checked={Boolean(selectionMap(selectedOptions)[label])}
                    onChange={(isSelected: boolean) =>
                      onChangeOption(option, isSelected)
                    }
                  >
                    {label}
                  </Checkbox>
                </OptionSubWrapper>
              );
            })}
            {isEmpty(options) && (
              <OptionSubWrapper>No options</OptionSubWrapper>
            )}
          </DropdownContent>
        }
      >
        <Checkbox
          name={category}
          color={categoryColor}
          indeterminate={isAnySelected && !isAllSelected}
          checked={isAllSelected || isAnySelected}
          onChange={onChangeCategory}
        >
          {category}
        </Checkbox>
      </Menu.Submenu>
    </OptionsCategoryWrapper>
  );
};

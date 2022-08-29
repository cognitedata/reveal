import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { Checkbox, Flex, Icon, Menu, Tooltip } from '@cognite/cogs.js';

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
  renderCategoryHelpText,
  onChangeOption,
  onChangeCategory,
}) => {
  if (!options) {
    return null;
  }

  const categoryColor = get(options[0], 'checkboxColor');
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
                    <Flex gap={4} alignItems="center">
                      {label}
                    </Flex>
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
          <Flex gap={4}>
            {category}
            {renderCategoryHelpText !== undefined && (
              <Tooltip content={renderCategoryHelpText?.(category)}>
                <Icon type="Info" />
              </Tooltip>
            )}
          </Flex>
        </Checkbox>
      </Menu.Submenu>
    </OptionsCategoryWrapper>
  );
};

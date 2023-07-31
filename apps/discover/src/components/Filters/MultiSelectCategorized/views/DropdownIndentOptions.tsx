import isEmpty from 'lodash/isEmpty';

import { Checkbox } from '@cognite/cogs.js';

import {
  CategoryWrapper,
  OptionsCategoryWrapper,
  OptionWrapper,
} from '../elements';
import { DropdownViewOption } from '../types';
import { selectionMap } from '../utils';

export const DropdownIndentOptions: React.FC<DropdownViewOption> = ({
  options,
  category,
  selectedOptions,
  onChangeOption,
  onChangeCategory,
}) => {
  const isAnySelected = !isEmpty(selectedOptions);
  const isAllSelected =
    (selectedOptions && selectedOptions.length) === options?.length;

  return (
    <OptionsCategoryWrapper>
      <CategoryWrapper>
        <Checkbox
          name={category}
          indeterminate={isAnySelected && !isAllSelected}
          checked={isAllSelected || isAnySelected}
          onChange={onChangeCategory}
        >
          {category}
        </Checkbox>
      </CategoryWrapper>

      {(options || []).map((option) => {
        const { label } = option;
        const name = `${category}-${label}`;

        return (
          <OptionWrapper key={name}>
            <Checkbox
              name={name}
              checked={Boolean(selectionMap(selectedOptions)[label])}
              onChange={(isSelected: boolean) =>
                onChangeOption(option, isSelected)
              }
            >
              {label}
            </Checkbox>
          </OptionWrapper>
        );
      })}
    </OptionsCategoryWrapper>
  );
};

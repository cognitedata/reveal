import React from 'react';

import isUndefined from 'lodash/isUndefined';
import { formatBigNumbersWithSuffix } from 'utils/number';
import { v1 } from 'uuid';

import { Checkbox } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';

import {
  CheckboxContainer,
  CheckboxFacetText,
  CheckboxItemContainer,
  CheckboxTitle,
  ResultsCountBadge,
} from './elements';

export type CheckboxState = {
  // from the API response:
  id?: string;
  name: string;

  // fields we have added:
  selected: boolean;
  count?: number;
};

interface Props {
  data: CheckboxState[];
  title?: string;
  onValueChange: (values: string[]) => void;
  hideResultsCount?: boolean;
}
export const Checkboxes: React.FC<Props> = ({
  data = [],
  title,
  onValueChange,
  hideResultsCount,
}) => {
  const onChange = (selected: boolean, option: CheckboxState) => {
    const selectedValues = data
      .filter(
        (row) =>
          (row.selected && row.name !== option.name) ||
          (selected && row.name === option.name)
      )
      .map((row) => row.name);

    onValueChange(selectedValues);
  };

  const renderBadgeContent = (row: CheckboxState) => {
    if (!isUndefined(row.count)) {
      const totalRowCountFormatted = formatBigNumbersWithSuffix(row.count);

      return (
        <ResultsCountBadge
          text={`${totalRowCountFormatted}`}
          disabled={!row.count}
        />
      );
    }

    return null;
  };

  const groupId = v1();

  return (
    <>
      {title && (
        <CheckboxTitle>
          <span>{title}</span>
        </CheckboxTitle>
      )}
      <CheckboxContainer>
        {data.map((row) => {
          const isDisabled = !isUndefined(row.count) && !row.count;

          return (
            <Checkbox
              name={`${groupId}_${row.name}`}
              key={row.name}
              checked={row.selected}
              disabled={isDisabled}
              onChange={(selected) => onChange(selected, row)}
            >
              <CheckboxItemContainer>
                <CheckboxFacetText
                  disabled={isDisabled}
                  data-testid="filter-checkbox-label"
                  level={2}
                >
                  <MiddleEllipsis value={row.name} />
                </CheckboxFacetText>
                {!hideResultsCount && renderBadgeContent(row)}
              </CheckboxItemContainer>
            </Checkbox>
          );
        })}
      </CheckboxContainer>
    </>
  );
};

export default React.memo(Checkboxes);

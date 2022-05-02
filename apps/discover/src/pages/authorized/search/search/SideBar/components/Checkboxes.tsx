import React from 'react';

import isUndefined from 'lodash/isUndefined';
import { formatBigNumbersWithSuffix } from 'utils/number';
import { v1 } from 'uuid';

import { Checkbox } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';

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
        <CheckboxTitle aria-label={`${title} label`}>
          <span>{title}</span>
        </CheckboxTitle>
      )}
      <CheckboxContainer>
        {data.map((row) => {
          const isDisabled = !isUndefined(row.count) && !row.count;

          return (
            <CheckboxItemContainer key={row.name}>
              <Checkbox
                name={`${groupId}_${row.name}`}
                checked={row.selected}
                disabled={isDisabled}
                onChange={(selected: any) => onChange(selected, row)}
              >
                <CheckboxFacetText
                  disabled={isDisabled}
                  data-testid="filter-checkbox-label"
                  level={2}
                >
                  <MiddleEllipsis value={row.name} />
                </CheckboxFacetText>
              </Checkbox>
              {!hideResultsCount && renderBadgeContent(row)}
            </CheckboxItemContainer>
          );
        })}
      </CheckboxContainer>
    </>
  );
};

export default React.memo(Checkboxes);

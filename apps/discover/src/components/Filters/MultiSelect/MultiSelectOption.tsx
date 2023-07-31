import capitalize from 'lodash/capitalize';
import isUndefined from 'lodash/isUndefined';
import { formatBigNumbersWithSuffix } from 'utils/number';

import { GreyBadge } from 'components/Badge';

import { MultiSelectFacetText, MultiSelectItemContainer } from './elements';

export interface MultiSelectOptionProps {
  value: string;
  count?: number;
  isTextCapitalized?: boolean;
}

export const MultiSelectOption: React.FC<MultiSelectOptionProps> = ({
  value,
  count,
  isTextCapitalized = true,
}) => {
  const getName = () => {
    if (isTextCapitalized) {
      return capitalize(value);
    }
    return value;
  };

  return (
    <MultiSelectItemContainer>
      <MultiSelectFacetText data-testid="filter-option-label" level={2}>
        {getName()}
      </MultiSelectFacetText>

      {!isUndefined(count) && (
        <GreyBadge text={`${formatBigNumbersWithSuffix(count)}`} />
      )}
    </MultiSelectItemContainer>
  );
};

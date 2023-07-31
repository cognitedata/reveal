import get from 'lodash/get';

import { OptionType } from '@cognite/cogs.js';

import { DisplayValue, MultiSelectTitle } from './elements';
import { MultiSelectOption } from './MultiSelectOption';
import { MultiSelectOptionType, TitlePlacement } from './types';

export const formatOptionLabelDefault =
  (isTextCapitalized?: boolean) =>
  ({ label, value }: OptionType<MultiSelectOptionType>) =>
    (
      <MultiSelectOption
        value={label}
        count={get(value, 'count')}
        isTextCapitalized={isTextCapitalized}
      />
    );

export const renderTitleAboveSelectComponent = (
  title: string,
  titlePlacement: TitlePlacement
) => {
  if (title && titlePlacement === 'top') {
    return (
      <MultiSelectTitle aria-label={`${title} label`}>{title}</MultiSelectTitle>
    );
  }
  return null;
};

export const renderMultiSelectDropdown =
  (footer: () => React.ReactNode) => (menu: React.ReactNode) => {
    return (
      <>
        {menu}
        {footer()}
      </>
    );
  };

export const renderPlaceholderSelectElement = (
  placeholderSelectElement: React.ReactNode,
  displayValue: string | undefined
) => {
  if (placeholderSelectElement) {
    return placeholderSelectElement;
  }

  if (displayValue) {
    return <DisplayValue>{displayValue}</DisplayValue>;
  }

  return null;
};

import * as React from 'react';

import { BaseFilter, TitleProps } from '../../components/BaseFilter';

const Title: React.FC<TitleProps> = React.memo(
  ({
    title,
    category,
    iconElement,
    description,
    handleClearFilters,
    ...rest
  }) => {
    return (
      <BaseFilter.FilterTitle
        title={title}
        iconElement={iconElement}
        category={category}
        description={description}
        handleClearFilters={handleClearFilters}
        {...rest}
      />
    );
  }
);

export default Title;

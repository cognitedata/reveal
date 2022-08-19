import * as React from 'react';

import { CategoryTypes } from 'modules/sidebar/types';

import { BaseFilter } from '../../components/BaseFilter';

interface HeaderProps {
  title: string;
  category: CategoryTypes;
  displayBetaSymbol?: boolean;
  handleClearFilters?: () => void;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ title, category, handleClearFilters, ...rest }) => {
    return (
      <BaseFilter.HeaderTitle
        title={title}
        category={category}
        handleClearFilters={handleClearFilters}
        {...rest}
      />
    );
  }
);

export default Header;

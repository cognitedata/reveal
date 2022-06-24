import { PAGES } from 'pages/routers/constants';
import React from 'react';
import { Link } from 'react-router-dom';

import { SearchButton } from './elements';

export const NavigateToSearchButton: React.FC = () => {
  return (
    <Link to={PAGES.SEARCH}>
      <SearchButton icon="Search">What are you looking for?</SearchButton>
    </Link>
  );
};

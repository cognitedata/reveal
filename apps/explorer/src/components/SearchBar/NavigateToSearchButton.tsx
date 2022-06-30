import { SearchModal } from 'components/SearchModal';
import React, { useState } from 'react';

import { SearchButton } from './elements';

export const NavigateToSearchButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <SearchModal isOpen={isOpen} handleClose={() => setIsOpen(!isOpen)} />
      <SearchButton onClick={() => setIsOpen(true)} icon="Search">
        What are you looking for?
      </SearchButton>
    </>
  );
};

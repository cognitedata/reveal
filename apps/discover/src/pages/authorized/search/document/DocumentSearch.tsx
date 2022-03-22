import React from 'react';

import { SearchWrapper } from '../elements';

import DocumentSearchContent from './results';

export const DocumentSearch: React.FC = () => {
  return (
    <>
      <SearchWrapper>
        <DocumentSearchContent />
      </SearchWrapper>
    </>
  );
};

export default DocumentSearch;

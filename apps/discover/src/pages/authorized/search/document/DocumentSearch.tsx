import React from 'react';

import FeedbackPanel from 'components/modals/entity-feedback';

import { SearchWrapper } from '../elements';

import DocumentSearchContent from './results';

export const DocumentSearch: React.FC = () => {
  return (
    <>
      <SearchWrapper>
        <DocumentSearchContent />
      </SearchWrapper>

      <FeedbackPanel />
    </>
  );
};

export default DocumentSearch;

import React from 'react';

import {
  RelatedDocumentDateRange,
  RelatedDocumentSource,
} from 'pages/authorized/search/search/SideBar/filters/relatedDocuments';
import { RelatedDocumentFileType } from 'pages/authorized/search/search/SideBar/filters/relatedDocuments/RelatedDocumentFIleType';

export const RelatedDocumentFilters: React.FC = () => {
  return (
    <>
      <RelatedDocumentFileType />
      <RelatedDocumentDateRange />
      <RelatedDocumentSource />
    </>
  );
};

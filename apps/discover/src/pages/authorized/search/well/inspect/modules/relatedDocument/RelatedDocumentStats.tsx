import * as React from 'react';

import { useDocumentSearchRelatedDocumentsQuery } from 'services/documentSearch/queries/useDocumentSearchRelatedDocumentsQuery';
import { useLabelsQuery } from 'services/labels/useLabelsQuery';

import { useDocumentResultRelatedCount } from 'modules/documentSearch/hooks/useDocumentResultRelatedCount';
import { getDocumentsFacetsInfo } from 'modules/documentSearch/utils';
import { SearchBreadcrumb } from 'pages/authorized/search/common/searchResult';
import { BreadCrumbStats } from 'pages/authorized/search/common/searchResult/types';

export const RelatedDocumentStats: React.FC = () => {
  const { results } = useDocumentSearchRelatedDocumentsQuery();

  const labels = useLabelsQuery();
  const documentResultCount = useDocumentResultRelatedCount();

  // dont show the badge at all if the data is not loaded yet
  if (!results) {
    return null;
  }

  const documentInformation = getDocumentsFacetsInfo(results.facets, labels);

  const documentStats: BreadCrumbStats = {
    label: 'Documents',
    totalResults: documentResultCount,
    currentHits: results.hits.length,
    info: documentInformation,
  };

  return <SearchBreadcrumb stats={[documentStats]} />;
};

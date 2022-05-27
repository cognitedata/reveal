import { useDocumentSearchResultQuery } from 'domain/documents/service/queries/useDocumentSearchResultQuery';

import * as React from 'react';

import { useLabelsQuery } from 'services/labels/useLabelsQuery';

import { reportException } from '@cognite/react-errors';

import { useDocumentResultCount } from 'modules/documentSearch/hooks/useDocumentResultCount';
import { getDocumentsFacetsInfo } from 'modules/documentSearch/utils';
import { SearchBreadcrumb } from 'pages/authorized/search/common/searchResult';

import { BreadCrumbStats } from '../../common/searchResult/types';

export const DocumentStats: React.FC = () => {
  const { results } = useDocumentSearchResultQuery();

  const labels = useLabelsQuery();
  const documentResultCount = useDocumentResultCount();

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

  // don't allow this to show any bad cases
  if (documentStats.totalResults) {
    if (documentStats.currentHits > documentStats.totalResults) {
      reportException('Document search results stats error', {
        ...documentStats,
      });
      return null;
    }
  }

  return <SearchBreadcrumb stats={[documentStats]} />;
};

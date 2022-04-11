import { useEffect, useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import orderBy from 'lodash/orderBy';

import Histogram from 'components/histogram/Histogram';
import Skeleton from 'components/skeleton';
import { DocumentQueryFacet } from 'modules/documentSearch/types';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
import { useRelatedDocumentDataStats } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/useRelatedDocument';
import { FlexGrow } from 'styles/layout';

import {
  WidgetContainer,
  DocumentTypeWidget,
  DocTypeHeader,
  DocTypeCount,
  DocTypeHeaderLabel,
} from './elements';

export const RelatedDocumentTypeFilter = () => {
  const patchRelatedDocumentFilters = usePatchRelatedDocumentFilters();
  const { facets, facetCounts } = useRelatedDocumentDataStats();
  const [options, setOptions] = useState<DocumentQueryFacet[]>();
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (facets?.labels) {
      setOptions(orderBy(facets.labels, 'count', 'desc'));
    } else {
      setOptions([]);
    }
  }, [JSON.stringify(facets?.labels)]);

  useEffect(() => {
    if (!isUndefined(facetCounts?.labels)) {
      setTotal(facetCounts.labels);
    } else {
      setTotal(0);
    }
  }, [JSON.stringify(facetCounts?.labels)]);

  const toggleFilter = (key: string) => {
    const labels = (options || [])
      .filter(
        (option) =>
          (option.key === key && !option.selected) ||
          (option.key !== key && option.selected)
      )
      .map((option) => ({
        externalId: option.key,
      }));
    patchRelatedDocumentFilters({
      labels,
    });
  };

  return (
    <WidgetContainer>
      <DocumentTypeWidget>
        {!options ? (
          <Skeleton.List lines={10} />
        ) : (
          <>
            <DocTypeHeader>
              <DocTypeHeaderLabel>Document type</DocTypeHeaderLabel>
              <FlexGrow />
              <DocTypeCount>{total} files</DocTypeCount>
            </DocTypeHeader>
            {options.map((option) => (
              <Histogram
                key={option.key}
                options={{ ...option, total }}
                toggleFilter={toggleFilter}
              />
            ))}
          </>
        )}
      </DocumentTypeWidget>
    </WidgetContainer>
  );
};

export default RelatedDocumentTypeFilter;

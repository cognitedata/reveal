import orderBy from 'lodash/orderBy';

import Histogram from 'components/Histogram/Histogram';
import Skeleton from 'components/Skeleton';
import { useDeepMemo } from 'hooks/useDeep';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
import { useRelatedDocumentDataStats } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocument';
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

  const options = useDeepMemo(() => {
    if (!facets?.labels) {
      return [];
    }
    return orderBy(facets.labels, 'count', 'desc');
  }, [facets?.labels]);

  const total = useDeepMemo(
    () => facetCounts.labels || 0,
    [facetCounts.labels]
  );

  const toggleFilter = (key: string) => {
    const labels = (options || [])
      .filter(
        (option) =>
          (option.name === key && !option.selected) ||
          (option.name !== key && option.selected)
      )
      .map((option) => ({
        externalId: option.name,
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
                key={option.name}
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

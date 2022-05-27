import { useDocumentSearchRelatedDocumentsQuery } from 'domain/documents/service/queries/useDocumentSearchRelatedDocumentsQuery';

import orderBy from 'lodash/orderBy';
import { withThousandSeparator } from 'utils/number';

import Histogram from 'components/Histogram/Histogram';
import Skeleton from 'components/Skeleton';
import { useDeepMemo } from 'hooks/useDeep';
import { useDocumentResultRelatedCount } from 'modules/documentSearch/hooks/useDocumentResultRelatedCount';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
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
  const { results } = useDocumentSearchRelatedDocumentsQuery();
  const { facets } = results;
  const totalResults = useDocumentResultRelatedCount();

  const options = useDeepMemo(() => {
    if (!facets?.labels) {
      return [];
    }
    return orderBy(facets.labels, 'count', 'desc');
  }, [facets?.labels]);

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
              <DocTypeCount>
                {withThousandSeparator(totalResults)} files
              </DocTypeCount>
            </DocTypeHeader>
            {options.map((option) => (
              <Histogram
                key={option.name}
                options={{ ...option, total: totalResults, key: option.name }}
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

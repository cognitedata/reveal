import { useTranslation } from 'react-i18next';

import { MultiSelect } from 'components/Filters';
import { useDeepMemo } from 'hooks/useDeep';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
import { useRelatedDocumentDataStats } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocument';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';

import { DropdownWrapper } from './elements';

export const RelatedDocumentSource = () => {
  const { t } = useTranslation();
  const { facets } = useRelatedDocumentDataStats();
  const patchRelatedDocumentFilters = usePatchRelatedDocumentFilters();
  const { facets: filters } = useRelatedDocumentFilterQuery();
  const locationFilters = filters.location;
  const selectedCount = locationFilters.length;

  const options = useDeepMemo(() => {
    if (!facets?.location) {
      return [];
    }
    return facets.location.map((row) => row.name);
  }, [facets?.location]);

  return (
    <DropdownWrapper>
      <MultiSelect
        theme="grey"
        title={t('Source')}
        SelectAllLabel={t('All')}
        options={options}
        selectedOptions={locationFilters}
        onValueChange={(values: string[]) => {
          patchRelatedDocumentFilters({ location: values });
        }}
        enableSelectAll
        showCustomCheckbox
        displayValue={
          options.length === selectedCount
            ? t('All')
            : `${locationFilters.length}`
        }
        hideClearIndicator
        disableTyping
      />
    </DropdownWrapper>
  );
};

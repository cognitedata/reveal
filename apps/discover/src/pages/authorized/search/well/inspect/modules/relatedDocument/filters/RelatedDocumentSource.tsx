import { useDocumentSearchRelatedDocumentsOnlyQuery } from 'domain/documents/service/queries/useDocumentSearchRelatedDocumentsOnlyQuery';

import { useTranslation } from 'react-i18next';

import { MultiSelect } from 'components/Filters';
import { useSetRelatedDocumentsFilters } from 'modules/inspectTabs/hooks/useSetRelatedDocumentsFilters';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';

import { DropdownWrapper } from './elements';

export const RelatedDocumentSource = () => {
  const { t } = useTranslation();
  const setRelatedDocumentFilters = useSetRelatedDocumentsFilters();
  const { facets: filters } = useRelatedDocumentFilterQuery();
  const locationFilters = filters.location;
  const selectedCount = locationFilters.length;
  const { results } = useDocumentSearchRelatedDocumentsOnlyQuery();

  const options = results.facets.location.map((row) => row.name);

  return (
    <DropdownWrapper>
      <MultiSelect
        theme="grey"
        title={t('Source')}
        SelectAllLabel={t('All')}
        options={options}
        selectedOptions={locationFilters}
        onValueChange={(values: string[]) => {
          setRelatedDocumentFilters({ location: values });
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

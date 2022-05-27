import { useDocumentSearchRelatedDocumentsOnlyQuery } from 'domain/documents/service/queries/useDocumentSearchRelatedDocumentsOnlyQuery';

import { useTranslation } from 'react-i18next';

import { MultiSelect } from 'components/Filters';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';

import { DropdownWrapper } from './elements';

export const RelatedDocumentFileType = () => {
  const { t } = useTranslation();
  const patchRelatedDocumentFilters = usePatchRelatedDocumentFilters();
  const { facets: filters } = useRelatedDocumentFilterQuery();
  const fileCategoryFilters = filters.fileCategory;
  const selectedCount = fileCategoryFilters.length;
  const { results } = useDocumentSearchRelatedDocumentsOnlyQuery();

  const options = results.facets.fileCategory.map((row) => row.name);

  return (
    <DropdownWrapper>
      <MultiSelect
        theme="grey"
        title={t('File Type')}
        SelectAllLabel={t('All')}
        options={options}
        selectedOptions={fileCategoryFilters}
        onValueChange={(values: string[]) => {
          patchRelatedDocumentFilters({ fileCategory: values });
        }}
        enableSelectAll
        showCustomCheckbox
        displayValue={
          options.length === selectedCount
            ? t('All')
            : `${fileCategoryFilters.length}`
        }
        hideClearIndicator
        disableTyping
      />
    </DropdownWrapper>
  );
};

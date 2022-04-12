import { useTranslation } from 'react-i18next';

import { MultiSelect } from 'components/filters';
import { useDeepMemo } from 'hooks/useDeep';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
import { useRelatedDocumentDataStats } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocument';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';

import { DropdownWrapper } from './elements';

export const RelatedDocumentFileType = () => {
  const { t } = useTranslation();
  const { facets } = useRelatedDocumentDataStats();
  const patchRelatedDocumentFilters = usePatchRelatedDocumentFilters();
  const { facets: filters } = useRelatedDocumentFilterQuery();
  const fileCategoryFilters = filters.fileCategory;
  const selectedCount = fileCategoryFilters.length;

  const options = useDeepMemo(() => {
    if (!facets?.fileCategory) {
      return [];
    }
    return facets.fileCategory.map((row) => row.name);
  }, [facets?.fileCategory]);

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

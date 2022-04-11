import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MultiSelect } from 'components/filters';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
import { useRelatedDocumentDataStats } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/useRelatedDocument';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/useRelatedDocumentFilterQuery';

import { DropdownWrapper } from './elements';

export const RelatedDocumentFileType = () => {
  const [options, setOptions] = useState<string[]>([]);
  const { t } = useTranslation();
  const { facets } = useRelatedDocumentDataStats();
  const patchRelatedDocumentFilters = usePatchRelatedDocumentFilters();
  const { facets: filters } = useRelatedDocumentFilterQuery();
  const filetypeFilters = filters.filetype;
  const selectedCount = filetypeFilters.length;

  useEffect(() => {
    if (facets?.filetype) {
      setOptions((facets?.filetype || []).map((row) => row.name));
    }
  }, [JSON.stringify(facets?.filetype)]);

  return (
    <DropdownWrapper>
      <MultiSelect
        theme="grey"
        title={t('File Type')}
        SelectAllLabel={t('All')}
        options={options}
        selectedOptions={filetypeFilters}
        onValueChange={(values: string[]) => {
          patchRelatedDocumentFilters({ filetype: values });
        }}
        enableSelectAll
        showCustomCheckbox
        displayValue={
          options.length === selectedCount
            ? t('All')
            : `${filetypeFilters.length}`
        }
        hideClearIndicator
        disableTyping
      />
    </DropdownWrapper>
  );
};

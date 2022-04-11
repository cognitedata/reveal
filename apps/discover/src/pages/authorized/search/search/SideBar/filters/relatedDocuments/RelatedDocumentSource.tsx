import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MultiSelect } from 'components/filters';
import { usePatchRelatedDocumentFilters } from 'modules/inspectTabs/hooks/usePatchRelatedDocumentFilters';
import { useRelatedDocumentDataStats } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/useRelatedDocument';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/useRelatedDocumentFilterQuery';

import { DropdownWrapper } from './elements';

export const RelatedDocumentSource = () => {
  const [options, setOptions] = useState<string[]>([]);
  const { t } = useTranslation();
  const { facets } = useRelatedDocumentDataStats();
  const patchRelatedDocumentFilters = usePatchRelatedDocumentFilters();
  const { facets: filters } = useRelatedDocumentFilterQuery();
  const locationFilters = filters.location;
  const selectedCount = locationFilters.length;

  useEffect(() => {
    if (facets?.location) {
      setOptions((facets?.location || []).map((row) => row.name));
    }
  }, [JSON.stringify(facets?.location)]);

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

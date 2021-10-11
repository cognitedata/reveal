import { useClearDocumentFilters } from 'modules/api/savedSearches/hooks/useClearDocumentFilters';
import { DocumentFilterCategoryTitles } from 'modules/documentSearch/types';

import { BaseFilter } from '../components/BaseFilter';
import { FilterCollapse } from '../components/FilterCollapse';

import Header from './common/Header';
import Title from './common/Title';
import {
  FileTypeFilter,
  DocumentTypeFilter,
  DateRangeFilter,
  SourceFilter,
} from './document';
import { TITLE, CATEGORY } from './document/constants';
import { DocumentServiceWrapper } from './document/DocumentServiceWrapper';
import { DocumentIconWrapper, DocumentIcon } from './elements';

export const DocumentFilter = () => {
  const clearDocumentFilters = useClearDocumentFilters();

  return (
    <BaseFilter>
      <Header
        title={TITLE}
        category={CATEGORY}
        handleClearFilters={clearDocumentFilters}
      />
      <DocumentServiceWrapper>
        {({ fileCategory, labels, location }) => (
          <FilterCollapse category={CATEGORY}>
            <SourceFilter category={CATEGORY} title="Source" data={location} />
            <FileTypeFilter
              title={DocumentFilterCategoryTitles.filetype}
              data={fileCategory}
              category={CATEGORY}
            />
            <DocumentTypeFilter
              title={DocumentFilterCategoryTitles.labels}
              data={labels}
              category={CATEGORY}
            />
            <DateRangeFilter />
          </FilterCollapse>
        )}
      </DocumentServiceWrapper>
    </BaseFilter>
  );
};

DocumentFilter.Title = () => {
  const clearDocumentFilters = useClearDocumentFilters();

  return (
    <Title
      iconElement={
        <DocumentIconWrapper>
          <DocumentIcon type="Document" />
        </DocumentIconWrapper>
      }
      title={TITLE}
      category={CATEGORY}
      description="Search for documents by source, format, type, creation date and more"
      handleClearFilters={clearDocumentFilters}
    />
  );
};

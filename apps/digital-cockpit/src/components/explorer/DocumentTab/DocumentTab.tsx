import { Badge } from '@cognite/cogs.js';
import { CogniteInternalId, FileInfo, FilesSearchFilter } from '@cognite/sdk';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { UseQueryResult } from 'react-query';
import useFileSearchQuery from 'hooks/useQuery/useFileSearchQuery';
import NoData from 'components/utils/NoData';
import Loading from 'components/utils/Loading';
import usePagination from 'hooks/usePagination';
import useFileAggregateQuery from 'hooks/useQuery/useFileAggregateQuery';
import SearchBar from 'components/search/SearchBar';
import { InternalFilterSettings } from 'components/search/types';
import { mapFiltersToCDF } from 'components/search/utils';

import DocumentGrouper from '../DocumentGrouper';
import DocumentRow from '../DocumentRow';
import { DocumentRowWrapper } from '../DocumentRow/DocumentRowWrapper';
import DocumentGlobalView from '../DocumentGlobalView';
import DocumentSidebar from '../DocumentSidebar';

import { DocumentTabWrapper, DocumentModal } from './elements';
import { FILE_FILTER_SELECTORS } from './consts';

export type DocumentTabProps = {
  // current version of @cognite/sdk v5.6.2 doesn't support parameter assetExternalIds
  // in FilesSearchFilter. So we can only use CogniteInternalId here
  assetId: CogniteInternalId;
  groupByField?: string;
};

const DocumentTab = ({ assetId, groupByField = '' }: DocumentTabProps) => {
  // The actual value of the input field
  const [filterValue, setFilterValue] = useState<InternalFilterSettings>({
    query: '',
    filters: [],
  });
  // The field we pass to the query (so we can debounce)
  const [filterQuery, setFilterQuery] = useState<FilesSearchFilter>();
  const debouncedSetFilterQuery = useMemo(
    () =>
      debounce((query: InternalFilterSettings) => {
        setFilterQuery(mapFiltersToCDF(query));
      }, 300),
    []
  );

  const [selectedDocument, setSelectedDocument] = useState<
    FileInfo | undefined
  >();

  const [documentModalOpened, setDocumentModalOpened] = useState(false);

  const isImgOrPdf = useMemo(
    () =>
      Boolean(
        selectedDocument?.mimeType?.includes('pdf') ||
          selectedDocument?.mimeType?.includes('image')
      ),
    [selectedDocument]
  );

  const { renderPagination, getPageData, resetPages } = usePagination();

  const { data: totalFilesOnAsset } = useFileAggregateQuery({
    filter: {
      assetIds: [assetId],
    },
  });
  const { data: totalFilesUnderAsset } = useFileAggregateQuery({
    filter: {
      assetSubtreeIds: [{ id: assetId }],
    },
  });
  const assetQuery = useFileSearchQuery({
    ...filterQuery,
    filter: {
      ...filterQuery?.filter,
      assetIds: [assetId],
    },
    limit: 500,
  });

  const relatedQuery = useFileSearchQuery({
    ...filterQuery,
    filter: {
      ...filterQuery?.filter,
      assetSubtreeIds: [{ id: assetId }],
    },
    limit: 500,
  });

  useEffect(() => {
    resetPages();
  }, [relatedQuery.data, assetQuery.data]);

  const renderSection = (
    { data, isLoading }: UseQueryResult<FileInfo[], unknown>,
    paginationName: string
  ) => {
    if (isLoading) {
      return <Loading />;
    }
    if (!data || data.length === 0) {
      return <NoData type="Documents" />;
    }
    if (groupByField) {
      return (
        <DocumentGrouper files={data} groupByField={groupByField}>
          {(documents, type) => (
            <DocumentRowWrapper>
              {getPageData(documents, `${paginationName}-${type}`).map(
                (document, i) => (
                  <DocumentRow
                    key={document.id}
                    document={document}
                    onClick={() => {
                      setSelectedDocument(document);
                    }}
                  />
                )
              )}
              {renderPagination({
                name: `${paginationName}-${type}`,
                total: data.length,
              })}
            </DocumentRowWrapper>
          )}
        </DocumentGrouper>
      );
    }

    return (
      <DocumentRowWrapper>
        {getPageData(data, paginationName).map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            onClick={() => {
              setSelectedDocument(document);
            }}
          />
        ))}
        {renderPagination({
          name: paginationName,
          total: data.length,
        })}
      </DocumentRowWrapper>
    );
  };

  const handleCloseModal = () => {
    setSelectedDocument(undefined);
    setDocumentModalOpened(false);
  };

  const renderPreview = () => {
    if (!selectedDocument) {
      return null;
    }

    // for pdf/img show sidebar with expand button
    if (isImgOrPdf) {
      return (
        <>
          <div className="document-tab--sidebar">
            <DocumentSidebar
              document={selectedDocument}
              handleSelect={handleCloseModal}
              handleExpandDocument={() => setDocumentModalOpened(true)}
            />
          </div>
          <DocumentModal
            visible={Boolean(documentModalOpened)}
            title={selectedDocument?.name}
            onCancel={handleCloseModal}
            footer={null}
            width={1320}
            closable
          >
            {documentModalOpened && (
              <DocumentGlobalView
                document={selectedDocument}
                handleSelect={handleCloseModal}
              />
            )}
          </DocumentModal>
        </>
      );
    }

    // show sidebar for any other type of document
    return (
      <div className="document-tab--sidebar">
        <DocumentSidebar document={selectedDocument} />
      </div>
    );
  };

  return (
    <DocumentTabWrapper style={{ paddingRight: selectedDocument ? 280 : 0 }}>
      <SearchBar
        value={filterValue}
        onChange={(next) => {
          setFilterValue(next);
          debouncedSetFilterQuery(next);
        }}
        selectors={FILE_FILTER_SELECTORS}
      />

      <section>
        <h3>
          On this asset{' '}
          <Badge
            text={String(
              (filterValue ? assetQuery.data?.length : totalFilesOnAsset) || 0
            )}
          />
        </h3>
        {renderSection(assetQuery, 'thisAsset')}
      </section>
      <section>
        <h3>
          Related documents{' '}
          <Badge
            text={String(
              (filterValue
                ? relatedQuery.data?.length
                : totalFilesUnderAsset) || 0
            )}
          />
        </h3>
        {renderSection(relatedQuery, 'relatedAssets')}
      </section>
      {renderPreview()}
    </DocumentTabWrapper>
  );
};

export default DocumentTab;

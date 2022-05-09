import { useAuthContext } from '@cognite/react-container';
import keyBy from 'lodash/keyBy';
import { useEffect, useMemo, useState } from 'react';

import { getParsedDocumentsByWorkspaceDocuments } from '../../modules/lineReviews/api';
import {
  ParsedDocument,
  WorkspaceDocument,
} from '../../modules/lineReviews/types';

const useParsedDocuments = (documents: WorkspaceDocument[]) => {
  const { client } = useAuthContext();

  const [isLoading, setIsLoading] = useState(true);
  const [parsedDocumentsCache, setParsedDocumentsCache] = useState<
    Record<string, ParsedDocument>
  >({});

  useEffect(() => {
    if (client !== undefined) {
      (async () => {
        const parsedDocuments = await getParsedDocumentsByWorkspaceDocuments(
          client,
          documents
        );

        setParsedDocumentsCache((previousParsedDocumentsCache) => ({
          ...previousParsedDocumentsCache,
          ...keyBy(
            parsedDocuments,
            (parsedDocument) => parsedDocument.pdfExternalId
          ),
        }));
        setIsLoading(false);
      })();
    }
  }, [client, documents]);

  const parsedDocuments = useMemo(
    () =>
      documents
        .filter(
          (document) =>
            parsedDocumentsCache[document.pdfExternalId] !== undefined
        )
        .map((document) => parsedDocumentsCache[document.pdfExternalId]),
    [documents, parsedDocumentsCache]
  );

  return {
    parsedDocuments,
    isLoading,
  };
};

export default useParsedDocuments;

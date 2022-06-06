import { useQuery } from 'react-query';

import { getDocument } from 'modules/documentSearch/service';
import { DocumentHighlight, DocumentType } from 'modules/documentSearch/types';
import { useSearchPhrase } from 'modules/sidebar/selectors';

export const useDocumentHighlightedContent = (
  doc: DocumentType
): [DocumentHighlight | undefined, boolean, unknown] => {
  const searchPhrase = useSearchPhrase();

  const { isLoading, error, data } = useQuery(['highlight', doc.id], () =>
    getDocument(searchPhrase, doc.doc.id).then((response) => response.highlight)
  );

  return [data, isLoading, error];
};

import { getAuthorsFilter } from 'domain/documents/internal/transformers/getAuthorsFilter';

import { useQuery } from 'react-query';

import { DOCUMENT_AUTHORS_QUERY_KEY } from 'constants/react-query';

import { getDocumentAuthors } from '../network/getDocumentAuthors';

export const useDocumentAuthorsQuery = () => {
  const results = useQuery([DOCUMENT_AUTHORS_QUERY_KEY], () => {
    return getDocumentAuthors();
  });
  return getAuthorsFilter(results);
};

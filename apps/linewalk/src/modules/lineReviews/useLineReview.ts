import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState } from 'react';

import { getLineReviewDocuments, getLineReviews } from './api';
import { LineReview, ParsedDocument } from './types';

const useLineReview = (
  id: string
): {
  isLoading: boolean;
  lineReview: LineReview | undefined;
  documents: ParsedDocument[] | undefined;
} => {
  const { client } = useAuthContext();
  const [{ isLoading, lineReview, documents }, setLineReviewState] = useState<{
    isLoading: boolean;
    lineReview: LineReview | undefined;
    documents: ParsedDocument[] | undefined;
  }>({
    isLoading: true,
    lineReview: undefined,
    documents: undefined,
  });

  useEffect(() => {
    (async () => {
      const lineReviews = await getLineReviews();
      const lineReview = lineReviews.find((l) => l.id === id);
      if (!lineReview) {
        throw new Error('No such line was found in the data');
      }

      const lineReviewDocuments = await getLineReviewDocuments(
        client,
        lineReview
      );

      setLineReviewState({
        isLoading: false,
        lineReview,
        documents: lineReviewDocuments,
      });
    })();
  }, []);

  return {
    isLoading,
    lineReview,
    documents,
  };
};

export default useLineReview;

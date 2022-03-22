import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState, useCallback } from 'react';

import { Discrepancy } from '../../components/LineReviewViewer/LineReviewViewer';

import {
  getLineReviewDocuments,
  getLineReviews,
  getLineReviewState,
} from './api';
import { LineReview, ParsedDocument } from './types';

const useLineReview = (
  id: string
): {
  isLoading: boolean;
  lineReview: LineReview | undefined;
  documents: ParsedDocument[] | undefined;
  discrepancies: Discrepancy[];
  setDiscrepancies: (discrepancies: Discrepancy[]) => void;
} => {
  const { client } = useAuthContext();
  const [
    { isLoading, lineReview, documents, discrepancies },
    setLineReviewState,
  ] = useState<{
    isLoading: boolean;
    lineReview: LineReview | undefined;
    documents: ParsedDocument[] | undefined;
    discrepancies: Discrepancy[];
  }>({
    isLoading: true,
    lineReview: undefined,
    documents: undefined,
    discrepancies: [],
  });

  useEffect(() => {
    (async () => {
      if (client === undefined) {
        throw new Error('No client found');
      }

      const lineReviews = await getLineReviews(client);
      const lineReview = lineReviews.find((l) => l.id === id);
      if (!lineReview) {
        throw new Error('No such line was found in the data');
      }

      const lineReviewDocuments = await getLineReviewDocuments(
        client,
        lineReview
      );

      const lineReviewState = await getLineReviewState(client, lineReview);

      setLineReviewState({
        isLoading: false,
        lineReview,
        documents: lineReviewDocuments,
        discrepancies: lineReviewState?.discrepancies ?? [],
      });
    })();
  }, []);

  const setDiscrepancies = useCallback(
    (discrepancies: Discrepancy[]) => {
      setLineReviewState((prevState) => ({
        ...prevState,
        discrepancies,
      }));
    },
    [setLineReviewState]
  );

  return {
    isLoading,
    lineReview,
    documents,
    discrepancies,
    setDiscrepancies,
  };
};

export default useLineReview;

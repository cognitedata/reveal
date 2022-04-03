import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState, useCallback } from 'react';

import { Discrepancy } from '../../components/LineReviewViewer/LineReviewViewer';

import {
  getLineReviewDocuments,
  getLineReviews,
  getLineReviewState,
} from './api';
import { LineReview, ParsedDocument, TextAnnotation } from './types';

const useLineReview = (
  id: string
): {
  isLoading: boolean;
  lineReview: LineReview | undefined;
  documents: ParsedDocument[] | undefined;
  discrepancies: Discrepancy[];
  textAnnotations: TextAnnotation[];
  setDiscrepancies: (
    transform: (previousDiscrepancies: Discrepancy[]) => Discrepancy[]
  ) => void;
  setTextAnnotations: (
    transform: (previousTextAnnotations: TextAnnotation[]) => TextAnnotation[]
  ) => void;
} => {
  const { client } = useAuthContext();
  const [
    { isLoading, lineReview, documents, discrepancies, textAnnotations },
    setLineReviewState,
  ] = useState<{
    isLoading: boolean;
    lineReview: LineReview | undefined;
    documents: ParsedDocument[] | undefined;
    discrepancies: Discrepancy[];
    textAnnotations: TextAnnotation[];
  }>({
    isLoading: true,
    lineReview: undefined,
    documents: undefined,
    discrepancies: [],
    textAnnotations: [],
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

      console.log('Loaded linereview state', lineReviewState);

      setLineReviewState({
        isLoading: false,
        lineReview,
        documents: lineReviewDocuments,
        discrepancies: lineReviewState?.discrepancies ?? [],
        textAnnotations: lineReviewState?.textAnnotations ?? [],
      });
    })();
  }, []);

  const setDiscrepancies = useCallback(
    (transform: (discrepancies: Discrepancy[]) => Discrepancy[]) => {
      setLineReviewState((prevState) => ({
        ...prevState,
        discrepancies: transform(prevState.discrepancies),
      }));
    },
    [setLineReviewState]
  );

  const setTextAnnotations = useCallback(
    (transform: (textAnnotations: TextAnnotation[]) => TextAnnotation[]) => {
      setLineReviewState((prevState) => ({
        ...prevState,
        textAnnotations: transform(prevState.textAnnotations),
      }));
    },
    [setLineReviewState]
  );

  return {
    isLoading,
    lineReview,
    documents,
    discrepancies,
    textAnnotations,
    setDiscrepancies,
    setTextAnnotations,
  };
};

export default useLineReview;

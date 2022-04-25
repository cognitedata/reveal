import { CogniteClient } from '@cognite/sdk';
import { useEffect, useState, useCallback } from 'react';

import { Discrepancy } from '../../components/LineReviewViewer/LineReviewViewer';

import { getLineReviewDocuments, getLineReviews } from './api';
import { LineReview, TextAnnotation, WorkspaceDocument } from './types';

const useLineReview = (
  client: CogniteClient | undefined,
  id: string
): {
  isLoading: boolean;
  lineReview: LineReview | undefined;
  documents: WorkspaceDocument[] | undefined;
  discrepancies: Discrepancy[];
  textAnnotations: TextAnnotation[];
  setDiscrepancies: (
    transform: (previousDiscrepancies: Discrepancy[]) => Discrepancy[]
  ) => void;
  setTextAnnotations: (
    transform: (previousTextAnnotations: TextAnnotation[]) => TextAnnotation[]
  ) => void;
  setDocuments: (
    transform: (previousDocuments: WorkspaceDocument[]) => WorkspaceDocument[]
  ) => void;
} => {
  const [
    { isLoading, lineReview, documents, discrepancies, textAnnotations },
    setLineReviewState,
  ] = useState<{
    isLoading: boolean;
    lineReview: LineReview | undefined;
    documents: WorkspaceDocument[];
    discrepancies: Discrepancy[];
    textAnnotations: TextAnnotation[];
  }>({
    isLoading: true,
    lineReview: undefined,
    documents: [],
    discrepancies: [],
    textAnnotations: [],
  });

  useEffect(() => {
    (async () => {
      if (client === undefined) {
        throw new Error('No client found');
      }

      const [lineReviews, lineReviewDocuments] = await Promise.all([
        getLineReviews(client),
        getLineReviewDocuments(client, id),
      ]);

      const lineReview = lineReviews.find((l) => l.id === id);
      if (!lineReview) {
        throw new Error('No such line was found in the data');
      }

      setLineReviewState({
        isLoading: false,
        lineReview,
        documents: lineReviewDocuments,
        discrepancies: lineReview?.discrepancies ?? [],
        textAnnotations: lineReview?.textAnnotations ?? [],
      });
    })();
  }, [client, id]);

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

  const setDocuments = useCallback(
    (transform: (documents: WorkspaceDocument[]) => WorkspaceDocument[]) => {
      setLineReviewState((prevState) => ({
        ...prevState,
        documents: transform(prevState.documents),
      }));
    },
    [setLineReviewState]
  );

  return {
    isLoading,
    lineReview,
    documents,
    setDocuments,
    discrepancies,
    textAnnotations,
    setDiscrepancies,
    setTextAnnotations,
  };
};

export default useLineReview;

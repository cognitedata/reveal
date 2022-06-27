import { getPdfPreview } from 'domain/documents/service/network/getPdfPreview';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import styled from 'styled-components/macro';

import { getAuthHeaders } from '@cognite/react-container';

import {
  LOG_DOCUMENT_PREVIEW,
  LOG_DOCUMENT_PREVIEW_NAMESPACE,
} from 'constants/logging';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';

pdfjs.GlobalWorkerOptions.workerSrc = `https://storage.googleapis.com/discover-pdfjs-2/pdf.worker.js`;

const PdfPreviewContainer = styled.div`
  display: flex;
  justify-content: center;
  min-height: 1024px;
  max-height: 1300px;
  overflow: auto;
`;

interface Props {
  documentId: string;
  onError: () => void;
  onSuccess: () => void;
}

const getHttpHeaders = () => {
  return { ...{ Accept: 'application/pdf' }, ...getAuthHeaders() };
};

export const PdfPreview: React.FC<Props> = ({
  documentId,
  onError,
  onSuccess,
}) => {
  const [numberOfPages, setNumberOfPages] = useState<number>();
  const [documentUrl, setDocumentUrl] = useState<string>();

  const [startTimer, stopTimer] = useMetricLogger(
    LOG_DOCUMENT_PREVIEW,
    TimeLogStages.Network,
    LOG_DOCUMENT_PREVIEW_NAMESPACE
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    stopTimer();
    setNumberOfPages(numPages);
    onSuccess();
  }

  useEffect(() => {
    const loadPdf = async () => {
      startTimer();
      getPdfPreview(documentId)
        .then((url) => setDocumentUrl(url))
        .catch(onError);
    };
    if (documentId) {
      loadPdf();
    }
  }, [documentId, startTimer, onSuccess, onError]);

  return (
    <PdfPreviewContainer>
      <Document
        file={{
          url: documentUrl,
          httpHeaders: getHttpHeaders(),
        }}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onError}
      >
        {Array.from(new Array(numberOfPages), (_pageNumber, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={1.5} />
        ))}
      </Document>
    </PdfPreviewContainer>
  );
};

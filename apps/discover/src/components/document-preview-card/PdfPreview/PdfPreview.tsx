import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import styled from 'styled-components/macro';

import { ITimer } from '@cognite/metrics';
import { getAuthHeaders } from '@cognite/react-container';

import {
  LOG_DOCUMENT_PREVIEW,
  LOG_DOCUMENT_PREVIEW_NAMESPACE,
} from 'constants/logging';
import {
  useGetCogniteMetric,
  useStartTimeLogger,
  useStopTimeLogger,
  TimeLogStages,
} from 'hooks/useTimeLog';
import { getPdfPreview } from 'modules/documentPreview/service';

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
  const [networkTimer, setNetworkTimer] = useState<ITimer>();
  const [documentUrl, setDocumentUrl] = useState<string>();

  const metric = useGetCogniteMetric(LOG_DOCUMENT_PREVIEW);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    useStopTimeLogger(networkTimer);
    setNumberOfPages(numPages);
    onSuccess();
  }

  useEffect(() => {
    setNetworkTimer(
      useStartTimeLogger(
        TimeLogStages.Network,
        metric,
        LOG_DOCUMENT_PREVIEW_NAMESPACE
      )
    );
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      const url = await getPdfPreview(documentId);
      setDocumentUrl(url);
    };
    loadPdf();
  }, [documentId]);

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

import { toast } from '@cognite/cogs.js';
import React, { useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { useDocumentPreviewLink } from '../../hooks/useDocumentPreview';

pdfjs.GlobalWorkerOptions.workerSrc = `https://storage.googleapis.com/discover-pdfjs-2/pdf.worker.js`;

const style = { background: 'blue', opacity: '0.3' };

interface Props {
  documentId?: number;
  itemsToHighlight?: string[];
}
function highlightPattern(text: string, patterns: string[]): JSX.Element {
  const pattern = patterns.find((pattern) => text.includes(pattern));

  if (pattern) {
    const splitText = text.split(pattern);

    if (splitText.length <= 1) {
      return <span>{text}</span>;
    }

    const matches = text.match(pattern);

    if (!matches) {
      return <span>{text}</span>;
    }

    return (
      <span>
        {splitText.reduce(
          (arr, element, index) =>
            matches[index]
              ? [
                  ...arr,
                  element,
                  <span style={style} key={element}>
                    {matches[index]}
                  </span>,
                ]
              : [...arr, element],
          [] as (string | React.ReactElement)[]
        )}
      </span>
    );
  }

  return <span>{text}</span>;
}

export const DocumentPreview: React.FC<Props> = ({
  documentId,
  itemsToHighlight,
}) => {
  const { data: previewLink } = useDocumentPreviewLink(documentId);

  const [numberOfPages, setNumberOfPages] = useState<number>();

  const textRenderer = useCallback(
    (textItem) => {
      return highlightPattern(textItem.str, itemsToHighlight || []);
    },
    [itemsToHighlight]
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumberOfPages(numPages);
  }

  function onError() {
    toast.error('Failed to load document preview');
  }

  if (!previewLink) {
    return null;
  }

  return (
    <Document
      file={{ url: previewLink }}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={onError}
    >
      {Array.from(new Array(numberOfPages), (_pageNumber, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          customTextRenderer={
            itemsToHighlight && itemsToHighlight?.length
              ? textRenderer
              : undefined
          }
        />
      ))}
    </Document>
  );
};

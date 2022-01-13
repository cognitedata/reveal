/* eslint-disable no-await-in-loop */
import { useEffect, useRef, useState } from 'react';
import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import { v4 as uuid } from 'uuid';
import * as PDFJS from 'pdfjs-dist';
import { Loader } from '@cognite/cogs.js';
import { DataElement, ScarletDocument } from 'scarlet/types';

import { addDocumentTitle, addPageNumber, addTags } from './utils';
import * as Styled from './style';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;

export type OrnateProps = {
  documents?: ScarletDocument[];
  fullwidth?: boolean;
  dataElements?: DataElement[];
};

const VIEW_OFFSET_X = 150;
const VIEW_OFFSET_Y = 200;
const SLIDE_WIDTH = 2500;
const SLIDE_COLUMN_GAP = 300;
const SLIDE_ROW_GAP = 200;

type OrnateDocument = {
  ornateDocument: OrnatePDFDocument;
  pageHeight: number;
  pageWidth: number;
  documentId: number;
  pageNumber: number;
  dataElements?: DataElement[];
};

export const Ornate = ({
  documents,
  dataElements = [],
  fullwidth = false,
}: OrnateProps) => {
  const componentContainerId = useRef(
    `react-ornate-instance-${uuid()}`
  ).current;
  const ornateViewer = useRef<CogniteOrnate>();
  const [ornateDocuments, setOrnateDocuments] = useState<OrnateDocument[]>([]);
  const [visibleDataElements, setVisibleDataElements] = useState<DataElement[]>(
    []
  );
  const destroyDocumentLoadCallbacks = useRef<(() => void)[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Setup Ornate
  useEffect(() => {
    if (ornateViewer.current) return;

    ornateViewer.current = new CogniteOrnate({
      container: `#${componentContainerId}`,
    });
  }, []);

  useEffect(() => {
    const ornateRef = ornateViewer.current;

    if (ornateRef && documents?.length && !ornateDocuments.length) {
      (async () => {
        await Promise.all(
          documents.map(async (document, iDocument) => {
            try {
              const pdfDocumentLoadingTask = await PDFJS.getDocument(
                document.downloadUrl!
              );

              destroyDocumentLoadCallbacks.current.push(
                pdfDocumentLoadingTask.destroy.bind(pdfDocumentLoadingTask)
              );

              const pdfDocument = await pdfDocumentLoadingTask.promise;
              const totalPages = pdfDocument?.numPages || 0;
              let yDocumentPosition = VIEW_OFFSET_Y;

              for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
                const page = await pdfDocument!.getPage(pageNumber);
                const pageWidth = page.view[2] - page.view[0];
                const pageHeight = page.view[3] - page.view[1];
                // after pdfToImage logic where min size of slide is 2500
                const slideWidth =
                  pageWidth > SLIDE_WIDTH ? pageWidth : SLIDE_WIDTH;
                const slideHeight = (pageHeight / pageWidth) * slideWidth;

                const ornateDocument = await ornateRef?.addPDFDocument(
                  pdfDocument,
                  pageNumber,
                  {},
                  {
                    zoomAfterLoad: false,
                    initialPosition: {
                      // --TODO: fix if needed
                      // it could be a problem if original page width is larger than slide width + slide column gap
                      // it's done like this to load documents async,
                      // so the next document position is not dependent on previous document width.
                      x:
                        VIEW_OFFSET_X +
                        iDocument * (SLIDE_WIDTH + SLIDE_COLUMN_GAP),
                      y: yDocumentPosition,
                    },
                    groupId: `${document.id}#${pageNumber}`,
                  }
                );

                addDocumentTitle({
                  document,
                  ornateDocument,
                });

                if (totalPages > 1) {
                  addPageNumber({
                    ornateDocument,
                    pageNumber,
                    totalPages,
                  });
                }

                yDocumentPosition += slideHeight + SLIDE_ROW_GAP;

                setOrnateDocuments((prevOrnateDocuments) => [
                  ...prevOrnateDocuments,
                  {
                    ornateDocument,
                    pageHeight,
                    pageWidth,
                    documentId: document.id,
                    pageNumber,
                  },
                ]);
              }
            } catch (e) {
              console.error(`Failed to load document: ${document.id}`, e);
            }
            return true;
          })
        );
        setIsInitialized(true);
      })();
    }
  }, [documents]);

  useEffect(
    () => () => {
      destroyDocumentLoadCallbacks.current.forEach((destroy) => destroy());
    },
    []
  );

  useEffect(() => {
    if (ornateDocuments.length) {
      const newVisibleDataElements: DataElement[] = [];
      ornateDocuments.forEach((document) => {
        const documentDataElements = dataElements?.filter(
          (dataElement) =>
            dataElement.sourceDocumentId === document.documentId &&
            dataElement.pageNumber === document.pageNumber
        );
        const newDataElements = documentDataElements?.filter((item) =>
          visibleDataElements.every(
            (visibleDataElement) => visibleDataElement.id !== item.id
          )
        );

        // const deletedDataElements = visibleDataElements?.filter((item) =>
        //   documentDataElements.every((dde) => dde.id !== item.id)
        // );

        addTags({
          ornateViewer: ornateViewer.current!,
          ornateDocument: document.ornateDocument,
          dataElements: newDataElements,
        });

        newVisibleDataElements.push(...documentDataElements);
      });

      setVisibleDataElements(newVisibleDataElements);
    }
  }, [ornateDocuments, dataElements]);

  return (
    <Styled.Container>
      {fullwidth ? (
        <Styled.FullWidthContainer>
          <div id={componentContainerId} />
        </Styled.FullWidthContainer>
      ) : (
        <div id={componentContainerId} />
      )}

      {!isInitialized && (
        <Styled.LoaderContainer>
          <Loader infoTitle="Loading documents" darkMode={false} />
        </Styled.LoaderContainer>
      )}
    </Styled.Container>
  );
};

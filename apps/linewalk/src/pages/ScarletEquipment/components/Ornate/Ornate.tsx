/* eslint-disable no-await-in-loop */
import { useEffect, useRef, useState } from 'react';
import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import { v4 as uuid } from 'uuid';
import * as PDFJS from 'pdfjs-dist';
import { ScarletDocument } from 'modules/scarlet/types';
import { Loader } from '@cognite/cogs.js';

import * as Styled from './style';
import { addDocumentTitle, addPageNumber } from './utils';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;

export type OrnateProps = {
  documents?: ScarletDocument[];
};

const VIEW_OFFSET_X = 150;
const VIEW_OFFSET_Y = 200;
const SLIDE_WIDTH = 2500;
const SLIDE_COLUMN_GAP = 300;
const SLIDE_ROW_GAP = 200;

type OrnateDocuments = {
  [documentId: number]: {
    [pageNumber: number]: {
      ornateDocument: OrnatePDFDocument;
      pageHeight: number;
      pageWidth: number;
    };
  };
};

export const Ornate = ({ documents }: OrnateProps) => {
  const componentContainerId = useRef(
    `react-ornate-instance-${uuid()}`
  ).current;
  const ornateViewer = useRef<CogniteOrnate>();
  const [ornateDocuments, setOrnateDocuments] = useState<OrnateDocuments>();
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

    if (ornateRef && documents?.length && !ornateDocuments) {
      (async () => {
        const newOrnateDocuments: OrnateDocuments = {};

        await Promise.all(
          documents.map(async (document, iDocument) => {
            try {
              const pdf = await PDFJS.getDocument(document.downloadUrl!)
                .promise;
              const nPages = pdf?.numPages || 0;
              let yDocumentPosition = VIEW_OFFSET_Y;

              for (let pageNumber = 1; pageNumber <= nPages; pageNumber++) {
                const page = await pdf!.getPage(pageNumber);
                const pageWidth = page.view[2] - page.view[0];
                const pageHeight = page.view[3] - page.view[1];
                // after pdfToImage logic where min size of slide is 2500
                const slideWidth =
                  pageWidth > SLIDE_WIDTH ? pageWidth : SLIDE_WIDTH;
                const slideHeight = (pageHeight / pageWidth) * slideWidth;

                const ornateDocument = await ornateRef?.addPDFDocument(
                  document.downloadUrl!,
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

                if (nPages > 1) {
                  addPageNumber({
                    ornateDocument,
                    pageNumber,
                  });
                }

                yDocumentPosition += slideHeight + SLIDE_ROW_GAP;

                if (!newOrnateDocuments[document.id]) {
                  newOrnateDocuments[document.id] = {};
                }
                newOrnateDocuments[document.id][pageNumber] = {
                  ornateDocument,
                  pageHeight,
                  pageWidth,
                };
              }
            } catch (e) {
              console.error(`Failed to load document: ${document.id}`, e);
            }
            return true;
          })
        );
        setOrnateDocuments(newOrnateDocuments);
        setIsInitialized(true);
      })();
    }
  }, [documents]);

  return (
    <Styled.Container>
      <div id={componentContainerId} />

      {!isInitialized && (
        <Styled.LoaderContainer>
          <Loader infoTitle="Loading documents" darkMode={false} />
        </Styled.LoaderContainer>
      )}
    </Styled.Container>
  );
};
